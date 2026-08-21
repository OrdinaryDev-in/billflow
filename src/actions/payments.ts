"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { recordPaymentSchema } from "@/lib/validation/invoices";
import { logActivity } from "@/lib/activity/log";
import type { ActionState } from "@/actions/auth";

export async function recordPayment(
  invoiceId: string,
  organizationId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = recordPaymentSchema.safeParse({
    amount: formData.get("amount"),
    paymentMethod: formData.get("paymentMethod"),
    paymentReference: formData.get("paymentReference"),
    paidAt: formData.get("paidAt"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const v = parsed.data;
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("payments")
    .insert({
      organization_id: organizationId,
      invoice_id: invoiceId,
      amount: v.amount,
      payment_method: v.paymentMethod,
      payment_reference: v.paymentReference || null,
      paid_at: new Date(v.paidAt).toISOString(),
      notes: v.notes || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  if (data) {
    await logActivity(supabase, {
      organizationId,
      entityType: "payment",
      entityId: data.id,
      action: "recorded",
      metadata: { amount: v.amount, method: v.paymentMethod },
    });
  }

  // invoices.amount_paid / balance_due / status are recalculated by the
  // recalculate_invoice_totals trigger (see supabase/migrations).
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/payments");
  return { success: true, message: "Payment recorded." };
}

export async function deletePayment(invoiceId: string, paymentId: string) {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("payments").delete().eq("id", paymentId);
  if (error) throw new Error(error.message);

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/payments");
}
