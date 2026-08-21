"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { clientSchema } from "@/lib/validation/clients";
import type { ActionState } from "@/actions/auth";

function parseClientForm(formData: FormData) {
  return clientSchema.safeParse({
    type: formData.get("type") || "company",
    name: formData.get("name"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    gstin: formData.get("gstin"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2"),
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
    notes: formData.get("notes"),
  });
}

export async function createClientRecord(
  organizationId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const v = parsed.data;
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      organization_id: organizationId,
      type: v.type,
      name: v.name,
      contact_name: v.contactName || null,
      email: v.email || null,
      phone: v.phone || null,
      gstin: v.gstin || null,
      address_line_1: v.addressLine1 || null,
      address_line_2: v.addressLine2 || null,
      city: v.city || null,
      state: v.state || null,
      pincode: v.pincode || null,
      notes: v.notes || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not create client." };
  }

  revalidatePath("/clients");
  redirect(`/clients/${data.id}`);
}

export async function updateClientRecord(
  clientId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const v = parsed.data;
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("clients")
    .update({
      type: v.type,
      name: v.name,
      contact_name: v.contactName || null,
      email: v.email || null,
      phone: v.phone || null,
      gstin: v.gstin || null,
      address_line_1: v.addressLine1 || null,
      address_line_2: v.addressLine2 || null,
      city: v.city || null,
      state: v.state || null,
      pincode: v.pincode || null,
      notes: v.notes || null,
    })
    .eq("id", clientId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  return { success: true, message: "Client saved." };
}

export async function setClientStatus(clientId: string, status: "active" | "archived") {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("clients").update({ status }).eq("id", clientId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
}
