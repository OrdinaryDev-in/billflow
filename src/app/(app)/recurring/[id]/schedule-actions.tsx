"use client";

import { useState, useTransition } from "react";
import { setScheduleStatus, generateScheduleNow } from "@/actions/recurring";

export function ScheduleActions({ scheduleId, status }: { scheduleId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {status === "active" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => setScheduleStatus(scheduleId, "paused"))}
            className="rounded-md border border-border-default px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-subtle disabled:opacity-60"
          >
            Pause
          </button>
        )}
        {status === "paused" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => setScheduleStatus(scheduleId, "active"))}
            className="rounded-md border border-border-default px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-subtle disabled:opacity-60"
          >
            Resume
          </button>
        )}
        {status !== "ended" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (confirm("End this schedule? It won't generate any more invoices.")) {
                startTransition(() => setScheduleStatus(scheduleId, "ended"));
              }
            }}
            className="rounded-md border border-border-default px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10 disabled:opacity-60"
          >
            End
          </button>
        )}
        {status === "active" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await generateScheduleNow(scheduleId);
                setMessage(
                  result.created
                    ? "Invoice generated."
                    : result.reason === "not_active"
                      ? "Schedule is not active."
                      : "Not due yet.",
                );
              })
            }
            className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-text-inverse hover:bg-primary-hover disabled:opacity-60"
          >
            {isPending ? "Generating…" : "Generate invoice now"}
          </button>
        )}
      </div>
      {message && <p className="text-xs text-text-secondary">{message}</p>}
    </div>
  );
}
