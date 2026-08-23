import type { WorkItemPriority, WorkItemStatus } from "@/lib/validation/work-items";

export const STATUS_LABELS: Record<WorkItemStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  completed: "Completed",
};

export const PRIORITY_LABELS: Record<WorkItemPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

/** Display order for the grouped work list (In Progress first — that's
 * what the user is actively doing — then Blocked, To Do, Completed). */
export const STATUS_GROUP_ORDER: WorkItemStatus[] = [
  "in_progress",
  "blocked",
  "todo",
  "completed",
];

export interface WorkItemLike {
  status: string;
  due_date: string | null;
}

/** Completed / total, or null when there are no work items yet (show
 * "No work items yet" rather than a misleading 0%). */
export function calculateProjectProgress(items: WorkItemLike[]): number | null {
  if (items.length === 0) return null;
  const completed = items.filter((i) => i.status === "completed").length;
  return Math.round((completed / items.length) * 100);
}

export function isDueSoon(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === "completed") return false;
  const today = new Date().toISOString().slice(0, 10);
  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);
  const in7DaysStr = in7Days.toISOString().slice(0, 10);
  return dueDate >= today && dueDate <= in7DaysStr;
}

export function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === "completed") return false;
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}
