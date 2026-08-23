import { cn } from "@/lib/utils";
import { PRIORITY_LABELS } from "@/lib/calculations/work-items";
import type { WorkItemPriority } from "@/lib/validation/work-items";

const PRIORITY_STYLES: Record<WorkItemPriority, string> = {
  low: "bg-surface-subtle text-text-tertiary",
  medium: "bg-primary-soft text-primary",
  high: "bg-warning/10 text-warning",
  urgent: "bg-danger/10 text-danger",
};

export function WorkItemPriorityBadge({ priority }: { priority: string }) {
  const p = priority as WorkItemPriority;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        PRIORITY_STYLES[p] ?? "bg-surface-subtle text-text-tertiary",
      )}
    >
      {PRIORITY_LABELS[p] ?? priority}
    </span>
  );
}
