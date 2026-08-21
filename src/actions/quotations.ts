"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { calculateDocumentTotals, calculateLineItem } from "@/lib/calculations/quotation";
import {
  quotationDetailsSchema,
  quotationItemSchema,
  type QuotationItemInput,
} from "@/lib/validation/quotations";
import { logActivity } from "@/lib/activity/log";
import type { ActionState } from "@/actions/auth";
import type { Tables } from "@/types/database";
import { z } from "zod";

export async function createDraftQuotation(organizationId: string, clientId: string) {
  const supabase = await createSupabaseClient();

  const { data: number, error: numberError } = await supabase.rpc("next_quotation_number", {
    target_organization_id: organizationId,
  });

  if (numberError || !number) {
    throw new Error(numberError?.message ?? "Could not allocate a quotation number.");
  }

  const { data, error } = await supabase
    .from("quotations")
    .insert({
      organization_id: organizationId,
      client_id: clientId,
      quotation_number: number,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create quotation.");
  }

  await logActivity(supabase, {
    organizationId,
    entityType: "quotation",
    entityId: data.id,
    action: "created",
    metadata: { quotation_number: number },
  });

  revalidatePath("/quotations");
  redirect(`/quotations/${data.id}`);
}

export async function updateQuotationDetails(
  quotationId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = quotationDetailsSchema.safeParse({
    clientId: formData.get("clientId"),
    issueDate: formData.get("issueDate"),
    validUntil: formData.get("validUntil"),
    scopeOfWork: formData.get("scopeOfWork"),
    deliverables: formData.get("deliverables"),
    timeline: formData.get("timeline"),
    assumptions: formData.get("assumptions"),
    exclusions: formData.get("exclusions"),
    notes: formData.get("notes"),
    terms: formData.get("terms"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const v = parsed.data;
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("quotations")
    .update({
      client_id: v.clientId,
      issue_date: v.issueDate,
      valid_until: v.validUntil || null,
      scope_of_work: v.scopeOfWork || null,
      deliverables: v.deliverables || null,
      timeline: v.timeline || null,
      assumptions: v.assumptions || null,
      exclusions: v.exclusions || null,
      notes: v.notes || null,
      terms: v.terms || null,
    })
    .eq("id", quotationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/quotations/${quotationId}`);
  return { success: true, message: "Details saved." };
}

const saveItemsPayload = z.array(quotationItemSchema);

export async function saveQuotationItems(quotationId: string, rawItems: QuotationItemInput[]) {
  const parsed = saveItemsPayload.safeParse(rawItems);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid line items");
  }
  const items = parsed.data;

  const totals = calculateDocumentTotals(
    items.map((i) => ({
      type: i.type,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discountType: i.discountType,
      discountValue: i.discountValue,
      taxRate: i.taxRate,
    })),
  );

  const supabase = await createSupabaseClient();

  const { error: deleteError } = await supabase
    .from("quotation_items")
    .delete()
    .eq("quotation_id", quotationId);
  if (deleteError) throw new Error(deleteError.message);

  if (items.length > 0) {
    const rows = items.map((item, index) => {
      const calc = calculateLineItem({
        type: item.type,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountType: item.discountType,
        discountValue: item.discountValue,
        taxRate: item.taxRate,
      });
      return {
        quotation_id: quotationId,
        sort_order: index,
        type: item.type,
        title: item.title,
        description: item.description || null,
        quantity: item.quantity,
        unit: item.unit || null,
        unit_price: item.unitPrice,
        discount_type: item.discountType,
        discount_value: item.discountValue,
        tax_rate: item.taxRate,
        line_total: calc.lineTotal,
      };
    });

    const { error: insertError } = await supabase.from("quotation_items").insert(rows);
    if (insertError) throw new Error(insertError.message);
  }

  const { error: updateError } = await supabase
    .from("quotations")
    .update({
      subtotal: totals.subtotal,
      discount_total: totals.discountTotal,
      tax_total: totals.taxTotal,
      grand_total: totals.grandTotal,
    })
    .eq("id", quotationId);
  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/quotations/${quotationId}`);
  revalidatePath("/quotations");

  return totals;
}

export async function sendQuotation(quotationId: string) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("quotations")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", quotationId)
    .select("organization_id, quotation_number")
    .single();

  if (error) throw new Error(error.message);

  // Email delivery is wired up once RESEND_API_KEY is configured (see .env.example).
  // Until then, the quotation is marked sent and shareable via its public link.

  if (data) {
    await logActivity(supabase, {
      organizationId: data.organization_id,
      entityType: "quotation",
      entityId: quotationId,
      action: "sent",
      metadata: { quotation_number: data.quotation_number },
    });
  }

  revalidatePath(`/quotations/${quotationId}`);
  revalidatePath("/quotations");
}

export async function duplicateQuotation(quotationId: string) {
  const supabase = await createSupabaseClient();

  const { data: original, error: fetchError } = await supabase
    .from("quotations")
    .select("*, quotation_items(*)")
    .eq("id", quotationId)
    .single();

  if (fetchError || !original) {
    throw new Error(fetchError?.message ?? "Quotation not found.");
  }

  const { data: number, error: numberError } = await supabase.rpc("next_quotation_number", {
    target_organization_id: original.organization_id,
  });
  if (numberError || !number) {
    throw new Error(numberError?.message ?? "Could not allocate a quotation number.");
  }

  const { data: copy, error: insertError } = await supabase
    .from("quotations")
    .insert({
      organization_id: original.organization_id,
      client_id: original.client_id,
      project_id: original.project_id,
      quotation_number: number,
      currency: original.currency,
      subtotal: original.subtotal,
      discount_total: original.discount_total,
      tax_total: original.tax_total,
      grand_total: original.grand_total,
      scope_of_work: original.scope_of_work,
      deliverables: original.deliverables,
      timeline: original.timeline,
      assumptions: original.assumptions,
      exclusions: original.exclusions,
      notes: original.notes,
      terms: original.terms,
      valid_until: original.valid_until,
    })
    .select("id")
    .single();

  if (insertError || !copy) {
    throw new Error(insertError?.message ?? "Could not duplicate quotation.");
  }

  const items = (original.quotation_items ?? []) as Tables<"quotation_items">[];
  if (items.length > 0) {
    const rows = items.map((item) => ({
      quotation_id: copy.id,
      sort_order: item.sort_order,
      type: item.type,
      title: item.title,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      discount_type: item.discount_type,
      discount_value: item.discount_value,
      tax_rate: item.tax_rate,
      line_total: item.line_total,
    }));
    const { error: itemsError } = await supabase.from("quotation_items").insert(rows);
    if (itemsError) throw new Error(itemsError.message);
  }

  revalidatePath("/quotations");
  redirect(`/quotations/${copy.id}`);
}
