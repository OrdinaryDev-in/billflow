"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/auth";
import { Field, FormMessage, Select, TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Tables } from "@/types/database";

const initialState: ActionState = {};

export function ClientForm({
  action,
  client,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  client?: Tables<"clients">;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 rounded-lg border border-border-default bg-surface p-6 shadow-sm sm:grid-cols-2">
        <Field label="Type" htmlFor="type">
          <Select id="type" name="type" defaultValue={client?.type ?? "company"}>
            <option value="company">Company</option>
            <option value="individual">Individual</option>
          </Select>
        </Field>
        <Field label="Name" htmlFor="name">
          <TextInput id="name" name="name" defaultValue={client?.name ?? ""} required autoFocus />
        </Field>
        <Field label="Contact name" htmlFor="contactName">
          <TextInput
            id="contactName"
            name="contactName"
            defaultValue={client?.contact_name ?? ""}
          />
        </Field>
        <Field label="Email" htmlFor="email">
          <TextInput id="email" name="email" type="email" defaultValue={client?.email ?? ""} />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <TextInput id="phone" name="phone" defaultValue={client?.phone ?? ""} />
        </Field>
        <Field label="GSTIN" htmlFor="gstin">
          <TextInput
            id="gstin"
            name="gstin"
            defaultValue={client?.gstin ?? ""}
            placeholder="22AAAAA0000A1Z5"
            className="uppercase"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-border-default bg-surface p-6 shadow-sm sm:grid-cols-2">
        <Field label="Address line 1" htmlFor="addressLine1" className="sm:col-span-2">
          <TextInput
            id="addressLine1"
            name="addressLine1"
            defaultValue={client?.address_line_1 ?? ""}
          />
        </Field>
        <Field label="Address line 2" htmlFor="addressLine2" className="sm:col-span-2">
          <TextInput
            id="addressLine2"
            name="addressLine2"
            defaultValue={client?.address_line_2 ?? ""}
          />
        </Field>
        <Field label="City" htmlFor="city">
          <TextInput id="city" name="city" defaultValue={client?.city ?? ""} />
        </Field>
        <Field label="State" htmlFor="state">
          <TextInput id="state" name="state" defaultValue={client?.state ?? ""} />
        </Field>
        <Field label="Pincode" htmlFor="pincode">
          <TextInput id="pincode" name="pincode" defaultValue={client?.pincode ?? ""} />
        </Field>
      </div>

      <div className="rounded-lg border border-border-default bg-surface p-6 shadow-sm">
        <Field label="Notes" htmlFor="notes">
          <TextArea id="notes" name="notes" rows={3} defaultValue={client?.notes ?? ""} />
        </Field>
      </div>

      <FormMessage error={state.error} success={state.message} />
      <div>
        <SubmitButton className="w-auto px-6" pendingText="Saving…">
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
