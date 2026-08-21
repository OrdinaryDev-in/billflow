"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { milestoneSchema, projectSchema } from "@/lib/validation/projects";
import { logActivity } from "@/lib/activity/log";
import type { ActionState } from "@/actions/auth";

export async function createProject(
  organizationId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = projectSchema.safeParse({
    clientId: formData.get("clientId"),
    name: formData.get("name"),
    description: formData.get("description"),
    contractValue: formData.get("contractValue"),
    billingType: formData.get("billingType"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const v = parsed.data;
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      organization_id: organizationId,
      client_id: v.clientId,
      name: v.name,
      description: v.description || null,
      contract_value: v.contractValue,
      billing_type: v.billingType,
      start_date: v.startDate || null,
      end_date: v.endDate || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not create project." };
  }

  await logActivity(supabase, {
    organizationId,
    entityType: "project",
    entityId: data.id,
    action: "created",
    metadata: { name: v.name },
  });

  revalidatePath("/projects");
  redirect(`/projects/${data.id}`);
}

export async function updateProject(
  projectId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = projectSchema.safeParse({
    clientId: formData.get("clientId"),
    name: formData.get("name"),
    description: formData.get("description"),
    contractValue: formData.get("contractValue"),
    billingType: formData.get("billingType"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const v = parsed.data;
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("projects")
    .update({
      client_id: v.clientId,
      name: v.name,
      description: v.description || null,
      contract_value: v.contractValue,
      billing_type: v.billingType,
      start_date: v.startDate || null,
      end_date: v.endDate || null,
    })
    .eq("id", projectId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  return { success: true, message: "Project saved." };
}

export async function setProjectStatus(
  projectId: string,
  status: "active" | "completed" | "on_hold" | "cancelled",
) {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("projects").update({ status }).eq("id", projectId);
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function convertQuotationToProject(quotationId: string) {
  const supabase = await createSupabaseClient();

  const { data: quotation, error: fetchError } = await supabase
    .from("quotations")
    .select("id, organization_id, client_id, quotation_number, grand_total, project_id")
    .eq("id", quotationId)
    .single();

  if (fetchError || !quotation) {
    throw new Error(fetchError?.message ?? "Quotation not found.");
  }

  if (quotation.project_id) {
    redirect(`/projects/${quotation.project_id}`);
  }

  const { data: project, error: insertError } = await supabase
    .from("projects")
    .insert({
      organization_id: quotation.organization_id,
      client_id: quotation.client_id,
      source_quotation_id: quotation.id,
      name: `Project — ${quotation.quotation_number}`,
      contract_value: quotation.grand_total,
      billing_type: "full",
    })
    .select("id")
    .single();

  if (insertError || !project) {
    throw new Error(insertError?.message ?? "Could not create project.");
  }

  await supabase.from("quotations").update({ project_id: project.id }).eq("id", quotationId);

  await logActivity(supabase, {
    organizationId: quotation.organization_id,
    entityType: "project",
    entityId: project.id,
    action: "created_from_quotation",
    metadata: { quotation_number: quotation.quotation_number },
  });

  revalidatePath("/projects");
  revalidatePath(`/quotations/${quotationId}`);
  redirect(`/projects/${project.id}`);
}

export async function createMilestone(
  projectId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = milestoneSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const v = parsed.data;
  const supabase = await createSupabaseClient();

  const { count } = await supabase
    .from("milestones")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  const { error } = await supabase.from("milestones").insert({
    project_id: projectId,
    name: v.name,
    description: v.description || null,
    amount: v.amount,
    due_date: v.dueDate || null,
    sort_order: count ?? 0,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: "Milestone added." };
}

export async function setMilestoneStatus(
  projectId: string,
  milestoneId: string,
  status: "pending" | "in_progress" | "completed",
) {
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("milestones")
    .update({ status })
    .eq("id", milestoneId);
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}`);
}

export async function deleteMilestone(projectId: string, milestoneId: string) {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("milestones").delete().eq("id", milestoneId);
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}`);
}
