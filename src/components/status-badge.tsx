import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-surface-subtle text-text-tertiary",
  sent: "bg-primary-soft text-primary",
  viewed: "bg-primary-soft text-primary",
  accepted: "bg-success/10 text-success",
  paid: "bg-success/10 text-success",
  partially_paid: "bg-warning/10 text-warning",
  changes_requested: "bg-warning/10 text-warning",
  overdue: "bg-danger/10 text-danger",
  rejected: "bg-danger/10 text-danger",
  cancelled: "bg-surface-subtle text-text-tertiary",
  expired: "bg-surface-subtle text-text-tertiary",
  active: "bg-success/10 text-success",
  completed: "bg-primary-soft text-primary",
  on_hold: "bg-warning/10 text-warning",
  pending: "bg-surface-subtle text-text-tertiary",
  in_progress: "bg-primary-soft text-primary",
  paused: "bg-warning/10 text-warning",
  ended: "bg-surface-subtle text-text-tertiary",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  paid: "Paid",
  partially_paid: "Partially paid",
  changes_requested: "Changes requested",
  overdue: "Overdue",
  rejected: "Rejected",
  cancelled: "Cancelled",
  expired: "Expired",
  active: "Active",
  completed: "Completed",
  on_hold: "On hold",
  pending: "Pending",
  in_progress: "In progress",
  paused: "Paused",
  ended: "Ended",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-surface-subtle text-text-tertiary",
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
