"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import {
  recurringScheduleDetailsSchema,
  recurringTemplateSchema,
  type RecurringTemplateInput,
} from "@/lib/validation/recurring";
import { generateInvoiceForSchedule } from "@/lib/recurring/generate";
import type { ActionState } from "@/actions/auth";

const EMPTY_TEMPLATE: RecurringTemplateInput = {
  items: [{ description: "", quantity: 1, unitPrice: 0, discountType: null, discountValue: 0, taxRate: 0, taxType: "none" }],
  notes: "",
  terms: "",
};

export async function createSchedule(
  organizationId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = recurringScheduleDetailsSchema.safeParse({
    name: formData.get("name"),
    clientId: formData.get("clientId"),
    projectId: formData.get("projectId") || "",
    frequency: formData.get("frequency"),
    intervalCount: formData.get("intervalCount"),
    nextRunAt: formData.get("nextRunAt"),
    endsAt: formData.get("endsAt"),
    dueDays: formData.get("dueDays"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const v = parsed.data;
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("recurring_invoice_schedules")
    .insert({
      organization_id: organizationId,
      client_id: v.clientId,
      project_id: v.projectId || null,
      name: v.name,
      frequency: v.frequency,
      interval_count: v.intervalCount,
      next_run_at: new Date(v.nextRunAt).toISOString(),
      ends_at: v.endsAt ? new Date(v.endsAt).toISOString() : null,
      due_days: v.dueDays,
      template_data: EMPTY_TEMPLATE,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not create schedule." };
  }

  revalidatePath("/recurring");
  redirect(`/recurring/${data.id}`);
}

export async function updateScheduleDetails(
  scheduleId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = recurringScheduleDetailsSchema.safeParse({
    name: formData.get("name"),
    clientId: formData.get("clientId"),
    projectId: formData.get("projectId") || "",
    frequency: formData.get("frequency"),
    intervalCount: formData.get("intervalCount"),
    nextRunAt: formData.get("nextRunAt"),
    endsAt: formData.get("endsAt"),
    dueDays: formData.get("dueDays"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const v = parsed.data;
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("recurring_invoice_schedules")
    .update({
      name: v.name,
      client_id: v.clientId,
      project_id: v.projectId || null,
      frequency: v.frequency,
      interval_count: v.intervalCount,
      next_run_at: new Date(v.nextRunAt).toISOString(),
      ends_at: v.endsAt ? new Date(v.endsAt).toISOString() : null,
      due_days: v.dueDays,
    })
    .eq("id", scheduleId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/recurring/${scheduleId}`);
  return { success: true, message: "Schedule saved." };
}

export async function saveScheduleTemplate(scheduleId: string, rawTemplate: RecurringTemplateInput) {
  const parsed = recurringTemplateSchema.safeParse(rawTemplate);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid template");
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("recurring_invoice_schedules")
    .update({ template_data: parsed.data })
    .eq("id", scheduleId);

  if (error) throw new Error(error.message);

  revalidatePath(`/recurring/${scheduleId}`);
}

export async function setScheduleStatus(scheduleId: string, status: "active" | "paused" | "ended") {
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("recurring_invoice_schedules")
    .update({ status })
    .eq("id", scheduleId);

  if (error) throw new Error(error.message);

  revalidatePath(`/recurring/${scheduleId}`);
  revalidatePath("/recurring");
}

export async function generateScheduleNow(scheduleId: string) {
  const supabase = await createSupabaseClient();
  const result = await generateInvoiceForSchedule(supabase, scheduleId, { force: true });

  revalidatePath(`/recurring/${scheduleId}`);
  revalidatePath("/invoices");
  return result;
}
