"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { workItemSchema, type WorkItemStatus } from "@/lib/validation/work-items";
import { logActivity } from "@/lib/activity/log";
import type { ActionState } from "@/actions/auth";

export async function createWorkItem(
  organizationId: string,
  projectId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = workItemSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    status: formData.get("status") || "todo",
    priority: formData.get("priority") || "medium",
    dueDate: formData.get("dueDate") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const v = parsed.data;
  const supabase = await createSupabaseClient();

  const { count } = await supabase
    .from("work_items")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  const { data, error } = await supabase
    .from("work_items")
    .insert({
      organization_id: organizationId,
      project_id: projectId,
      title: v.title,
      description: v.description || null,
      status: v.status,
      priority: v.priority,
      due_date: v.dueDate || null,
      sort_order: count ?? 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not create work item." };
  }

  await logActivity(supabase, {
    organizationId,
    entityType: "work_item",
    entityId: data.id,
    action: "created",
    metadata: { title: v.title },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/work`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { success: true, message: "Work item added." };
}

export async function updateWorkItem(
  workItemId: string,
  projectId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = workItemSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    status: formData.get("status") || "todo",
    priority: formData.get("priority") || "medium",
    dueDate: formData.get("dueDate") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const v = parsed.data;
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("work_items")
    .update({
      title: v.title,
      description: v.description || null,
      status: v.status,
      priority: v.priority,
      due_date: v.dueDate || null,
    })
    .eq("id", workItemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/work`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { success: true, message: "Work item saved." };
}

export async function updateWorkItemStatus(
  workItemId: string,
  projectId: string,
  status: WorkItemStatus,
) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("work_items")
    .update({ status })
    .eq("id", workItemId)
    .select("organization_id, title, status")
    .single();

  if (error) throw new Error(error.message);

  if (data) {
    await logActivity(supabase, {
      organizationId: data.organization_id,
      entityType: "work_item",
      entityId: workItemId,
      action: status === "completed" ? "completed" : "status_changed",
      metadata: { title: data.title, to: status },
    });
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/work`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function deleteWorkItem(workItemId: string, projectId: string) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("work_items")
    .delete()
    .eq("id", workItemId)
    .select("organization_id, title")
    .single();

  if (error) throw new Error(error.message);

  if (data) {
    await logActivity(supabase, {
      organizationId: data.organization_id,
      entityType: "work_item",
      entityId: workItemId,
      action: "deleted",
      metadata: { title: data.title },
    });
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/work`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}
