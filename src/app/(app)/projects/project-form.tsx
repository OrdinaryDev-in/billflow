"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/auth";
import { Field, FormMessage, Select, TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Tables } from "@/types/database";

const initialState: ActionState = {};

export function ProjectForm({
  action,
  clients,
  project,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  clients: { id: string; name: string }[];
  project?: Tables<"projects">;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Client" htmlFor="clientId">
          <Select id="clientId" name="clientId" defaultValue={project?.client_id ?? ""} required>
            {!project && (
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
        <Field label="Project name" htmlFor="name">
          <TextInput id="name" name="name" defaultValue={project?.name ?? ""} required autoFocus />
        </Field>
        <Field label="Contract value (₹)" htmlFor="contractValue">
          <TextInput
            id="contractValue"
            name="contractValue"
            type="number"
            step="any"
            min={0}
            defaultValue={project?.contract_value ?? 0}
          />
        </Field>
        <Field label="Billing type" htmlFor="billingType">
          <Select id="billingType" name="billingType" defaultValue={project?.billing_type ?? "full"}>
            <option value="full">Full payment</option>
            <option value="advance_balance">Advance + balance</option>
            <option value="milestone">Milestones</option>
            <option value="recurring">Recurring</option>
          </Select>
        </Field>
        <Field label="Start date" htmlFor="startDate">
          <TextInput id="startDate" name="startDate" type="date" defaultValue={project?.start_date ?? ""} />
        </Field>
        <Field label="End date" htmlFor="endDate">
          <TextInput id="endDate" name="endDate" type="date" defaultValue={project?.end_date ?? ""} />
        </Field>
      </div>
      <Field label="Description" htmlFor="description">
        <TextArea id="description" name="description" rows={3} defaultValue={project?.description ?? ""} />
      </Field>

      <FormMessage error={state.error} success={state.message} />
      <div>
        <SubmitButton className="w-auto px-6" pendingText="Saving…">
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
