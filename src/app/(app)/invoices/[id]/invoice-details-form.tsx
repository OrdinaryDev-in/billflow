"use client";

import { useActionState } from "react";
import { updateInvoiceDetails } from "@/actions/invoices";
import type { ActionState } from "@/actions/auth";
import { Field, FormMessage, Select, TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Tables } from "@/types/database";

const initialState: ActionState = {};

export function InvoiceDetailsForm({
  invoice,
  clients,
  projects,
  readOnly,
}: {
  invoice: Tables<"invoices">;
  clients: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  readOnly: boolean;
}) {
  const action = updateInvoiceDetails.bind(null, invoice.id);
  const [state, formAction] = useActionState(action, initialState);

  return (
    <fieldset disabled={readOnly} className="contents">
      <form
        action={formAction}
        className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Client" htmlFor="clientId">
            <Select id="clientId" name="clientId" defaultValue={invoice.client_id} required>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Project" htmlFor="projectId">
            <Select id="projectId" name="projectId" defaultValue={invoice.project_id ?? ""}>
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Issue date" htmlFor="issueDate">
            <TextInput
              id="issueDate"
              name="issueDate"
              type="date"
              defaultValue={invoice.issue_date}
              required
            />
          </Field>
          <Field label="Due date" htmlFor="dueDate">
            <TextInput id="dueDate" name="dueDate" type="date" defaultValue={invoice.due_date ?? ""} />
          </Field>
          <Field label="PO number" htmlFor="poNumber">
            <TextInput id="poNumber" name="poNumber" defaultValue={invoice.po_number ?? ""} />
          </Field>
        </div>
        <Field label="Notes" htmlFor="notes">
          <TextArea id="notes" name="notes" rows={2} defaultValue={invoice.notes ?? ""} />
        </Field>
        <Field label="Terms & payment terms" htmlFor="terms">
          <TextArea id="terms" name="terms" rows={3} defaultValue={invoice.terms ?? ""} />
        </Field>

        <FormMessage error={state.error} success={state.message} />
        {!readOnly && (
          <div>
            <SubmitButton className="w-auto px-6" pendingText="Saving…">
              Save details
            </SubmitButton>
          </div>
        )}
      </form>
    </fieldset>
  );
}
