"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CURRENT_ORG_COOKIE } from "@/lib/organizations/current";
import {
  businessSettingsSchema,
  createOrganizationSchema,
} from "@/lib/validation/organizations";
import type { ActionState } from "@/actions/auth";

export async function createOrganization(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createOrganizationSchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_organization_with_owner", {
    org_name: parsed.data.name,
  });

  if (error || !data) {
    return { error: error?.message ?? "Could not create organization." };
  }

  const cookieStore = await cookies();
  cookieStore.set(CURRENT_ORG_COOKIE, data.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect("/dashboard");
}

export async function updateBusinessSettings(
  organizationId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = businessSettingsSchema.safeParse({
    ...raw,
    gstEnabled: formData.get("gstEnabled") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      name: v.name,
      legal_name: v.legalName || null,
      email: v.email || null,
      phone: v.phone || null,
      website: v.website || null,
      address_line_1: v.addressLine1 || null,
      address_line_2: v.addressLine2 || null,
      city: v.city || null,
      state: v.state || null,
      pincode: v.pincode || null,
      gst_enabled: v.gstEnabled,
      gstin: v.gstin || null,
      pan: v.pan || null,
      bank_account_name: v.bankAccountName || null,
      bank_account_number: v.bankAccountNumber || null,
      bank_ifsc: v.bankIfsc || null,
      bank_name: v.bankName || null,
      upi_id: v.upiId || null,
      default_payment_terms: v.defaultPaymentTerms || null,
      invoice_prefix: v.invoicePrefix,
      quotation_prefix: v.quotationPrefix,
    })
    .eq("id", organizationId);

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Business settings saved." };
}
