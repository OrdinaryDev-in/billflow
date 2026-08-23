"use client";

import { useState, useTransition } from "react";
import { createWorkItem, updateWorkItem, updateWorkItemStatus, deleteWorkItem } from "@/actions/work-items";
import { WorkItemPriorityBadge } from "@/components/work-item-priority-badge";
import {
  STATUS_GROUP_ORDER,
  STATUS_LABELS,
  isDueSoon,
  isOverdue,
} from "@/lib/calculations/work-items";
import type { WorkItemStatus } from "@/lib/validation/work-items";
import { WorkItemForm } from "./work-item-form";
import type { Tables } from "@/types/database";
import { cn } from "@/lib/utils";

export function WorkItemsBoard({
  organizationId,
  projectId,
  initialItems,
}: {
  organizationId: string;
  projectId: string;
  initialItems: Tables<"work_items">[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const groups = STATUS_GROUP_ORDER.map((status) => ({
    status,
    items: initialItems
      .filter((i) => i.status === status)
      .sort((a, b) => a.sort_order - b.sort_order),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover"
          >
            + Add work
          </button>
        ) : (
          <div className="rounded-lg border border-border-default bg-surface p-4 shadow-sm">
            <WorkItemForm
              action={createWorkItem.bind(null, organizationId, projectId)}
              submitLabel="Create work"
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}
      </div>

      {initialItems.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border-default bg-surface px-6 py-16 text-center shadow-sm">
          <p className="text-sm font-medium text-text-primary">No work items yet</p>
          <p className="text-sm text-text-secondary">
            Add the work needed to complete this project.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.status}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                {STATUS_LABELS[group.status]} ({group.items.length})
              </h2>
              <ul className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-border-default bg-surface p-4 shadow-sm"
                  >
                    {editingId === item.id ? (
                      <WorkItemForm
                        action={updateWorkItem.bind(null, item.id, projectId)}
                        workItem={item}
                        submitLabel="Save"
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm font-medium text-text-primary",
                              item.status === "completed" && "line-through text-text-tertiary",
                            )}
                          >
                            {item.status === "completed" && "✓ "}
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="mt-0.5 text-xs text-text-tertiary">{item.description}</p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <WorkItemPriorityBadge priority={item.priority} />
                            {item.due_date && (
                              <span
                                className={cn(
                                  "text-xs",
                                  isOverdue(item.due_date, item.status)
                                    ? "font-medium text-danger"
                                    : isDueSoon(item.due_date, item.status)
                                      ? "font-medium text-warning"
                                      : "text-text-tertiary",
                                )}
                              >
                                Due {item.due_date}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <select
                            value={item.status}
                            disabled={isPending}
                            onChange={(e) =>
                              startTransition(() =>
                                updateWorkItemStatus(
                                  item.id,
                                  projectId,
                                  e.target.value as WorkItemStatus,
                                ),
                              )
                            }
                            className="rounded-md border border-border-default bg-surface px-2 py-1.5 text-xs text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="blocked">Blocked</option>
                            <option value="completed">Completed</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => setEditingId(item.id)}
                            className="rounded-md border border-border-default px-2 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-subtle"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => {
                              if (confirm(`Delete "${item.title}"?`)) {
                                startTransition(() => deleteWorkItem(item.id, projectId));
                              }
                            }}
                            className="rounded-md px-2 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
