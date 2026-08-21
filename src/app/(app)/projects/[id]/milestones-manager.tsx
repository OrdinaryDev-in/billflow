"use client";

import { useActionState, useTransition } from "react";
import { createMilestone, deleteMilestone, setMilestoneStatus } from "@/actions/projects";
import { createInvoiceFromMilestone } from "@/actions/invoices";
import type { ActionState } from "@/actions/auth";
import { Field, FormMessage, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/calculations/quotation";
import type { Tables } from "@/types/database";

const initialState: ActionState = {};

export function MilestonesManager({
  projectId,
  milestones,
  currency,
}: {
  projectId: string;
  milestones: Tables<"milestones">[];
  currency: string;
}) {
  const action = createMilestone.bind(null, projectId);
  const [state, formAction] = useActionState(action, initialState);
  const [isPending, startTransition] = useTransition();

  const total = milestones.reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">Milestones</h2>
        {milestones.length > 0 && (
          <span className="text-xs text-text-tertiary">
            {formatCurrency(total, currency)} scheduled
          </span>
        )}
      </div>

      {milestones.length > 0 && (
        <ul className="flex flex-col gap-2">
          {milestones.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-md border border-border-default px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{m.name}</p>
                <p className="text-xs text-text-tertiary">
                  {formatCurrency(m.amount, currency)}
                  {m.due_date && <> · due {m.due_date}</>}
                  {m.invoiced_amount > 0 && (
                    <> · invoiced {formatCurrency(m.invoiced_amount, currency)}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={m.status} />
                <select
                  value={m.status}
                  disabled={isPending}
                  onChange={(e) =>
                    startTransition(() =>
                      setMilestoneStatus(
                        projectId,
                        m.id,
                        e.target.value as "pending" | "in_progress" | "completed",
                      ),
                    )
                  }
                  className="rounded-md border border-border-default bg-surface px-2 py-1 text-xs text-text-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
                {m.invoiced_amount < m.amount && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(() => createInvoiceFromMilestone(projectId, m.id))
                    }
                    className="rounded-md border border-border-default px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface-subtle"
                  >
                    Invoice
                  </button>
                )}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => deleteMilestone(projectId, m.id))}
                  className="rounded px-1.5 py-1 text-xs text-danger hover:bg-danger/10"
                  aria-label="Delete milestone"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="grid grid-cols-1 gap-3 border-t border-border-default pt-4 sm:grid-cols-4">
        <Field label="Name" htmlFor="name" className="sm:col-span-2">
          <TextInput id="name" name="name" placeholder="Design" required />
        </Field>
        <Field label="Amount (₹)" htmlFor="amount">
          <TextInput id="amount" name="amount" type="number" step="any" min={0} required />
        </Field>
        <Field label="Due date" htmlFor="dueDate">
          <TextInput id="dueDate" name="dueDate" type="date" />
        </Field>
        <div className="sm:col-span-4">
          <FormMessage error={state.error} success={state.message} />
        </div>
        <div className="sm:col-span-4">
          <SubmitButton className="w-auto px-4" pendingText="Adding…">
            Add milestone
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
