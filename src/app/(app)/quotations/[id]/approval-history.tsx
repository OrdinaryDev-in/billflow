import type { Tables } from "@/types/database";

const ACTION_LABELS: Record<string, string> = {
  viewed: "Viewed by client",
  accepted: "Accepted",
  rejected: "Rejected",
  changes_requested: "Changes requested",
};

export function ApprovalHistory({ events }: { events: Tables<"quotation_approval_events">[] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="rounded-lg border border-border-default bg-surface p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-text-primary">Client activity</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {sorted.map((event) => (
          <li key={event.id} className="text-sm">
            <p className="text-text-primary">
              <span className="font-medium">{ACTION_LABELS[event.action] ?? event.action}</span>
              {event.client_name && <span className="text-text-secondary"> by {event.client_name}</span>}
            </p>
            {event.client_message && (
              <p className="mt-0.5 text-text-secondary">&ldquo;{event.client_message}&rdquo;</p>
            )}
            <p className="mt-0.5 text-xs text-text-tertiary">
              {new Date(event.created_at).toLocaleString("en-IN")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
