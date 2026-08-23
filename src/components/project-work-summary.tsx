import Link from "next/link";
import { calculateProjectProgress, isDueSoon, isOverdue } from "@/lib/calculations/work-items";
import { WorkItemPriorityBadge } from "@/components/work-item-priority-badge";
import type { Tables } from "@/types/database";

export function ProjectWorkSummary({
  projectId,
  workItems,
}: {
  projectId: string;
  workItems: Tables<"work_items">[];
}) {
  const progress = calculateProjectProgress(workItems);
  const completed = workItems.filter((i) => i.status === "completed").length;
  const inProgress = workItems.filter((i) => i.status === "in_progress").length;
  const blocked = workItems.filter((i) => i.status === "blocked").length;
  const dueSoon = workItems.filter((i) => isDueSoon(i.due_date, i.status)).length;
  const overdue = workItems.filter((i) => isOverdue(i.due_date, i.status)).length;
  const nextWorkItem = workItems
    .filter((i) => i.status === "in_progress" || i.status === "todo")
    .sort((a, b) => a.sort_order - b.sort_order)[0];

  return (
    <div className="rounded-lg border border-border-default bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">Work</h2>
        <Link
          href={`/projects/${projectId}/work`}
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          View all work →
        </Link>
      </div>

      {progress === null ? (
        <p className="mt-3 text-sm text-text-secondary">No work items yet.</p>
      ) : (
        <>
          <div className="mt-3 flex items-center gap-4">
            <p className="text-3xl font-bold tabular-nums text-text-primary">{progress}%</p>
            <div className="flex-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-text-tertiary">
                {workItems.length} work items · {completed} completed · {inProgress} in progress
                {blocked > 0 && ` · ${blocked} blocked`}
              </p>
            </div>
          </div>

          {nextWorkItem && (
            <div className="mt-4 rounded-md border border-border-default p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Next work
              </p>
              <p className="mt-1 text-sm font-medium text-text-primary">{nextWorkItem.title}</p>
              <div className="mt-1 flex items-center gap-2">
                <WorkItemPriorityBadge priority={nextWorkItem.priority} />
                {nextWorkItem.due_date && (
                  <span className="text-xs text-text-tertiary">Due {nextWorkItem.due_date}</span>
                )}
              </div>
            </div>
          )}

          {(blocked > 0 || dueSoon > 0 || overdue > 0) && (
            <ul className="mt-3 flex flex-col gap-1">
              {blocked > 0 && (
                <li className="text-xs font-medium text-danger">
                  ⚠ {blocked} blocked work item{blocked > 1 ? "s" : ""}
                </li>
              )}
              {overdue > 0 && (
                <li className="text-xs font-medium text-danger">
                  ⚠ {overdue} work item{overdue > 1 ? "s" : ""} overdue
                </li>
              )}
              {dueSoon > 0 && (
                <li className="text-xs font-medium text-warning">
                  ⚠ {dueSoon} work item{dueSoon > 1 ? "s" : ""} due soon
                </li>
              )}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
