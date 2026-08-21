"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/auth";
import { Field, FormMessage, Select, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Tables } from "@/types/database";

const initialState: ActionState = {};

export function ScheduleDetailsForm({
  action,
  clients,
  projects,
  schedule,
  readOnly,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  clients: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  schedule?: Tables<"recurring_invoice_schedules">;
  readOnly?: boolean;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <fieldset disabled={readOnly} className="contents">
      <form
        action={formAction}
        className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Schedule name" htmlFor="name" className="sm:col-span-2">
            <TextInput
              id="name"
              name="name"
              placeholder="Monthly maintenance retainer"
              defaultValue={schedule?.name ?? ""}
              required
              autoFocus
            />
          </Field>
          <Field label="Client" htmlFor="clientId">
            <Select id="clientId" name="clientId" defaultValue={schedule?.client_id ?? ""} required>
              {!schedule && (
                <option value="" disabled>
                  Select a client
                </option>
              )}
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Project (optional)" htmlFor="projectId">
            <Select id="projectId" name="projectId" defaultValue={schedule?.project_id ?? ""}>
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Frequency" htmlFor="frequency">
            <Select id="frequency" name="frequency" defaultValue={schedule?.frequency ?? "monthly"}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </Field>
          <Field label="Every N periods" htmlFor="intervalCount">
            <TextInput
              id="intervalCount"
              name="intervalCount"
              type="number"
              min={1}
              defaultValue={schedule?.interval_count ?? 1}
            />
          </Field>
          <Field label="First / next run date" htmlFor="nextRunAt">
            <TextInput
              id="nextRunAt"
              name="nextRunAt"
              type="date"
              defaultValue={schedule?.next_run_at?.slice(0, 10) ?? ""}
              required
            />
          </Field>
          <Field label="Ends on (optional)" htmlFor="endsAt">
            <TextInput
              id="endsAt"
              name="endsAt"
              type="date"
              defaultValue={schedule?.ends_at?.slice(0, 10) ?? ""}
            />
          </Field>
          <Field label="Payment due (days after issue)" htmlFor="dueDays">
            <TextInput
              id="dueDays"
              name="dueDays"
              type="number"
              min={0}
              defaultValue={schedule?.due_days ?? 7}
            />
          </Field>
        </div>

        <FormMessage error={state.error} success={state.message} />
        {!readOnly && (
          <div>
            <SubmitButton className="w-auto px-6" pendingText="Saving…">
              {submitLabel}
            </SubmitButton>
          </div>
        )}
      </form>
    </fieldset>
  );
}
