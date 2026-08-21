import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateDocumentTotals, calculateLineItem } from "@/lib/calculations/quotation";
import { determineTaxType } from "@/lib/calculations/invoice";
import { advanceScheduleDate, type ScheduleFrequency } from "@/lib/calculations/schedule";
import type { RecurringTemplateInput } from "@/lib/validation/recurring";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export type GenerateResult =
  | { created: true; invoiceId: string; scheduleEnded: boolean }
  | { created: false; reason: "not_active" | "not_due" };

/**
 * Generates the next invoice for a recurring schedule and advances
 * next_run_at. Safe to call more than once for the same due date: the
 * schedule's next_run_at is always derived from its *previous* value (not
 * from "now"), so a second call before the next period starts sees
 * next_run_at in the future and no-ops — see product plan's "every
 * scheduled operation must be safe to run more than once" rule.
 *
 * `force: true` (used by the manual "Generate now" button) skips the
 * due-date check but still requires the schedule to be active.
 */
export async function generateInvoiceForSchedule(
  supabase: Client,
  scheduleId: string,
  options: { force?: boolean } = {},
): Promise<GenerateResult> {
  const { data: schedule, error: scheduleError } = await supabase
    .from("recurring_invoice_schedules")
    .select("*")
    .eq("id", scheduleId)
    .single();

  if (scheduleError || !schedule) {
    throw new Error(scheduleError?.message ?? "Schedule not found.");
  }

  if (schedule.status !== "active") {
    return { created: false, reason: "not_active" };
  }

  if (!options.force && new Date(schedule.next_run_at) > new Date()) {
    return { created: false, reason: "not_due" };
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("gst_enabled, state")
    .eq("id", schedule.organization_id)
    .single();
  const { data: client } = await supabase
    .from("clients")
    .select("state")
    .eq("id", schedule.client_id)
    .single();

  const taxType = determineTaxType({
    gstEnabled: organization?.gst_enabled ?? false,
    organizationState: organization?.state,
    clientState: client?.state,
  });

  const template = schedule.template_data as unknown as RecurringTemplateInput;
  const totals = calculateDocumentTotals(
    template.items.map((i) => ({ ...i, type: "item" as const })),
  );

  const { data: number, error: numberError } = await supabase.rpc("next_invoice_number", {
    target_organization_id: schedule.organization_id,
  });
  if (numberError || !number) {
    throw new Error(numberError?.message ?? "Could not allocate an invoice number.");
  }

  const issueDate = new Date();
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + schedule.due_days);

  const { data: invoice, error: insertError } = await supabase
    .from("invoices")
    .insert({
      organization_id: schedule.organization_id,
      client_id: schedule.client_id,
      project_id: schedule.project_id,
      recurring_schedule_id: schedule.id,
      invoice_number: number,
      currency: schedule.currency,
      issue_date: issueDate.toISOString().slice(0, 10),
      due_date: dueDate.toISOString().slice(0, 10),
      subtotal: totals.subtotal,
      discount_total: totals.discountTotal,
      tax_total: totals.taxTotal,
      grand_total: totals.grandTotal,
      balance_due: totals.grandTotal,
      notes: template.notes || null,
      terms: template.terms || null,
    })
    .select("id")
    .single();

  if (insertError || !invoice) {
    throw new Error(insertError?.message ?? "Could not create invoice.");
  }

  const rows = template.items.map((item, index) => {
    const calc = calculateLineItem({ ...item, type: "item" });
    return {
      invoice_id: invoice.id,
      sort_order: index,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit || null,
      unit_price: item.unitPrice,
      discount_type: item.discountType,
      discount_value: item.discountValue,
      tax_rate: item.taxRate,
      tax_type: taxType,
      line_total: calc.lineTotal,
    };
  });
  const { error: itemsError } = await supabase.from("invoice_items").insert(rows);
  if (itemsError) throw new Error(itemsError.message);

  const nextRunAt = advanceScheduleDate(
    new Date(schedule.next_run_at),
    schedule.frequency as ScheduleFrequency,
    schedule.interval_count,
  );
  const scheduleEnded = !!schedule.ends_at && nextRunAt > new Date(schedule.ends_at);

  const { error: updateError } = await supabase
    .from("recurring_invoice_schedules")
    .update({
      last_invoice_id: invoice.id,
      next_run_at: nextRunAt.toISOString(),
      status: scheduleEnded ? "ended" : "active",
    })
    .eq("id", schedule.id);
  if (updateError) throw new Error(updateError.message);

  return { created: true, invoiceId: invoice.id, scheduleEnded };
}
