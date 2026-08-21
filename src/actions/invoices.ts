"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { calculateDocumentTotals, calculateLineItem } from "@/lib/calculations/quotation";
import { determineTaxType } from "@/lib/calculations/invoice";
import {
  invoiceDetailsSchema,
  saveInvoiceItemsSchema,
  type InvoiceItemInput,
} from "@/lib/validation/invoices";
import type { ActionState } from "@/actions/auth";
import type { Tables } from "@/types/database";

async function claimInvoiceNumber(
  supabase: Awaited<ReturnType<typeof createSupabaseClient>>,
  organizationId: string,
) {
  const { data: number, error } = await supabase.rpc("next_invoice_number", {
    target_organization_id: organizationId,
  });
  if (error || !number) {
    throw new Error(error?.message ?? "Could not allocate an invoice number.");
  }
  return number as string;
}

export async function createDraftInvoice(
  organizationId: string,
  clientId: string,
  projectId?: string,
) {
  const supabase = await createSupabaseClient();
  const number = await claimInvoiceNumber(supabase, organizationId);

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      organization_id: organizationId,
      client_id: clientId,
      project_id: projectId || null,
      invoice_number: number,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create invoice.");
  }

  revalidatePath("/invoices");
  redirect(`/invoices/${data.id}`);
}

export async function createInvoiceFromQuotation(quotationId: string) {
  const supabase = await createSupabaseClient();

  const { data: quotation, error: fetchError } = await supabase
    .from("quotations")
    .select("*, quotation_items(*)")
    .eq("id", quotationId)
    .single();

  if (fetchError || !quotation) {
    throw new Error(fetchError?.message ?? "Quotation not found.");
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("gst_enabled, state")
    .eq("id", quotation.organization_id)
    .single();
  const { data: client } = await supabase
    .from("clients")
    .select("state")
    .eq("id", quotation.client_id)
    .single();

  const taxType = determineTaxType({
    gstEnabled: organization?.gst_enabled ?? false,
    organizationState: organization?.state,
    clientState: client?.state,
  });

  const number = await claimInvoiceNumber(supabase, quotation.organization_id);

  const { data: invoice, error: insertError } = await supabase
    .from("invoices")
    .insert({
      organization_id: quotation.organization_id,
      client_id: quotation.client_id,
      project_id: quotation.project_id,
      source_quotation_id: quotation.id,
      invoice_number: number,
      currency: quotation.currency,
      subtotal: quotation.subtotal,
      discount_total: quotation.discount_total,
      tax_total: quotation.tax_total,
      grand_total: quotation.grand_total,
      balance_due: quotation.grand_total,
      terms: quotation.terms,
      notes: quotation.notes,
    })
    .select("id")
    .single();

  if (insertError || !invoice) {
    throw new Error(insertError?.message ?? "Could not create invoice.");
  }

  const items = (quotation.quotation_items ?? []).filter(
    (i: Tables<"quotation_items">) => i.type === "item",
  ) as Tables<"quotation_items">[];

  if (items.length > 0) {
    const rows = items.map((item, index) => ({
      invoice_id: invoice.id,
      sort_order: index,
      description: item.title + (item.description ? ` — ${item.description}` : ""),
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      discount_type: item.discount_type,
      discount_value: item.discount_value,
      tax_rate: item.tax_rate,
      tax_type: taxType,
      line_total: item.line_total,
    }));
    const { error: itemsError } = await supabase.from("invoice_items").insert(rows);
    if (itemsError) throw new Error(itemsError.message);
  }

  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}

export async function createInvoiceFromMilestone(projectId: string, milestoneId: string) {
  const supabase = await createSupabaseClient();

  const { data: milestone, error: fetchError } = await supabase
    .from("milestones")
    .select("*, projects(organization_id, client_id, currency)")
    .eq("id", milestoneId)
    .single();

  if (fetchError || !milestone) {
    throw new Error(fetchError?.message ?? "Milestone not found.");
  }

  const project = milestone.projects as unknown as {
    organization_id: string;
    client_id: string;
    currency: string;
  };
  const remaining = milestone.amount - milestone.invoiced_amount;
  if (remaining <= 0) {
    throw new Error("This milestone is already fully invoiced.");
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("gst_enabled, state")
    .eq("id", project.organization_id)
    .single();
  const { data: client } = await supabase
    .from("clients")
    .select("state")
    .eq("id", project.client_id)
    .single();

  const taxType = determineTaxType({
    gstEnabled: organization?.gst_enabled ?? false,
    organizationState: organization?.state,
    clientState: client?.state,
  });

  const number = await claimInvoiceNumber(supabase, project.organization_id);

  const { data: invoice, error: insertError } = await supabase
    .from("invoices")
    .insert({
      organization_id: project.organization_id,
      client_id: project.client_id,
      project_id: projectId,
      milestone_id: milestone.id,
      invoice_number: number,
      currency: project.currency,
      subtotal: remaining,
      grand_total: remaining,
      balance_due: remaining,
    })
    .select("id")
    .single();

  if (insertError || !invoice) {
    throw new Error(insertError?.message ?? "Could not create invoice.");
  }

  const { error: itemError } = await supabase.from("invoice_items").insert({
    invoice_id: invoice.id,
    sort_order: 0,
    description: `Milestone: ${milestone.name}`,
    quantity: 1,
    unit_price: remaining,
    tax_type: taxType,
    line_total: remaining,
  });
  if (itemError) throw new Error(itemError.message);

  await supabase
    .from("milestones")
    .update({ invoiced_amount: milestone.invoiced_amount + remaining })
    .eq("id", milestoneId);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoiceDetails(
  invoiceId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = invoiceDetailsSchema.safeParse({
    clientId: formData.get("clientId"),
    projectId: formData.get("projectId") || "",
    issueDate: formData.get("issueDate"),
    dueDate: formData.get("dueDate"),
    poNumber: formData.get("poNumber"),
    notes: formData.get("notes"),
    terms: formData.get("terms"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const v = parsed.data;
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("invoices")
    .update({
      client_id: v.clientId,
      project_id: v.projectId || null,
      issue_date: v.issueDate,
      due_date: v.dueDate || null,
      po_number: v.poNumber || null,
      notes: v.notes || null,
      terms: v.terms || null,
    })
    .eq("id", invoiceId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/invoices/${invoiceId}`);
  return { success: true, message: "Details saved." };
}

export async function saveInvoiceItems(invoiceId: string, rawItems: InvoiceItemInput[]) {
  const parsed = saveInvoiceItemsSchema.safeParse(rawItems);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid line items");
  }
  const items = parsed.data;

  const totals = calculateDocumentTotals(
    items.map((i) => ({
      type: "item" as const,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discountType: i.discountType,
      discountValue: i.discountValue,
      taxRate: i.taxRate,
    })),
  );

  const supabase = await createSupabaseClient();

  const { error: deleteError } = await supabase
    .from("invoice_items")
    .delete()
    .eq("invoice_id", invoiceId);
  if (deleteError) throw new Error(deleteError.message);

  if (items.length > 0) {
    const rows = items.map((item, index) => {
      const calc = calculateLineItem({
        type: "item",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountType: item.discountType,
        discountValue: item.discountValue,
        taxRate: item.taxRate,
      });
      return {
        invoice_id: invoiceId,
        sort_order: index,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit || null,
        unit_price: item.unitPrice,
        discount_type: item.discountType,
        discount_value: item.discountValue,
        tax_rate: item.taxRate,
        tax_type: item.taxType,
        line_total: calc.lineTotal,
      };
    });
    const { error: insertError } = await supabase.from("invoice_items").insert(rows);
    if (insertError) throw new Error(insertError.message);
  }

  const { data: invoice } = await supabase
    .from("invoices")
    .select("amount_paid")
    .eq("id", invoiceId)
    .single();
  const amountPaid = invoice?.amount_paid ?? 0;

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      subtotal: totals.subtotal,
      discount_total: totals.discountTotal,
      tax_total: totals.taxTotal,
      grand_total: totals.grandTotal,
      balance_due: totals.grandTotal - amountPaid,
    })
    .eq("id", invoiceId);
  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");

  return totals;
}

export async function sendInvoice(invoiceId: string) {
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("invoices")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (error) throw new Error(error.message);

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
}

export async function cancelInvoice(invoiceId: string) {
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("invoices")
    .update({ status: "cancelled" })
    .eq("id", invoiceId);

  if (error) throw new Error(error.message);

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
}
