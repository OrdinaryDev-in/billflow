"use client";

import { useActionState } from "react";
import { updateQuotationDetails } from "@/actions/quotations";
import type { ActionState } from "@/actions/auth";
import { Field, FormMessage, Select, TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Tables } from "@/types/database";

const initialState: ActionState = {};

export function QuotationDetailsForm({
  quotation,
  clients,
  readOnly,
}: {
  quotation: Tables<"quotations">;
  clients: { id: string; name: string }[];
  readOnly: boolean;
}) {
  const action = updateQuotationDetails.bind(null, quotation.id);
  const [state, formAction] = useActionState(action, initialState);

  return (
    <fieldset disabled={readOnly} className="contents">
      <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Client" htmlFor="clientId">
            <Select id="clientId" name="clientId" defaultValue={quotation.client_id} required>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Issue date" htmlFor="issueDate">
            <TextInput
              id="issueDate"
              name="issueDate"
              type="date"
              defaultValue={quotation.issue_date}
              required
            />
          </Field>
          <Field label="Valid until" htmlFor="validUntil">
            <TextInput
              id="validUntil"
              name="validUntil"
              type="date"
              defaultValue={quotation.valid_until ?? ""}
            />
          </Field>
        </div>

        <Field label="Scope of work" htmlFor="scopeOfWork">
          <TextArea
            id="scopeOfWork"
            name="scopeOfWork"
            rows={3}
            defaultValue={quotation.scope_of_work ?? ""}
          />
        </Field>
        <Field label="Deliverables" htmlFor="deliverables">
          <TextArea
            id="deliverables"
            name="deliverables"
            rows={3}
            defaultValue={quotation.deliverables ?? ""}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Timeline" htmlFor="timeline">
            <TextArea id="timeline" name="timeline" rows={2} defaultValue={quotation.timeline ?? ""} />
          </Field>
          <Field label="Assumptions" htmlFor="assumptions">
            <TextArea
              id="assumptions"
              name="assumptions"
              rows={2}
              defaultValue={quotation.assumptions ?? ""}
            />
          </Field>
        </div>
        <Field label="Exclusions" htmlFor="exclusions">
          <TextArea id="exclusions" name="exclusions" rows={2} defaultValue={quotation.exclusions ?? ""} />
        </Field>
        <Field label="Notes" htmlFor="notes">
          <TextArea id="notes" name="notes" rows={2} defaultValue={quotation.notes ?? ""} />
        </Field>
        <Field label="Terms & payment terms" htmlFor="terms">
          <TextArea id="terms" name="terms" rows={3} defaultValue={quotation.terms ?? ""} />
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
