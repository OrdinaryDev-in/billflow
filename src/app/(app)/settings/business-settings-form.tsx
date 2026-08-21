"use client";

import { useActionState, useState } from "react";
import { updateBusinessSettings } from "@/actions/organizations";
import type { ActionState } from "@/actions/auth";
import { Field, FormMessage, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Tables } from "@/types/database";
import { cn } from "@/lib/utils";

const initialState: ActionState = {};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface p-6 shadow-sm">
      <legend className="px-1 text-sm font-semibold text-text-primary">{title}</legend>
      {children}
    </fieldset>
  );
}

export function BusinessSettingsForm({
  organization,
}: {
  organization: Tables<"organizations">;
}) {
  const action = updateBusinessSettings.bind(null, organization.id);
  const [state, formAction] = useActionState(action, initialState);
  const [gstEnabled, setGstEnabled] = useState(organization.gst_enabled);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Section title="Business identity">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Business name" htmlFor="name">
            <TextInput id="name" name="name" defaultValue={organization.name} required />
          </Field>
          <Field label="Legal name" htmlFor="legalName">
            <TextInput
              id="legalName"
              name="legalName"
              defaultValue={organization.legal_name ?? ""}
            />
          </Field>
          <Field label="Email" htmlFor="email">
            <TextInput
              id="email"
              name="email"
              type="email"
              defaultValue={organization.email ?? ""}
            />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <TextInput id="phone" name="phone" defaultValue={organization.phone ?? ""} />
          </Field>
          <Field label="Website" htmlFor="website" className="sm:col-span-2">
            <TextInput id="website" name="website" defaultValue={organization.website ?? ""} />
          </Field>
        </div>
      </Section>

      <Section title="Address">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Address line 1" htmlFor="addressLine1" className="sm:col-span-2">
            <TextInput
              id="addressLine1"
              name="addressLine1"
              defaultValue={organization.address_line_1 ?? ""}
            />
          </Field>
          <Field label="Address line 2" htmlFor="addressLine2" className="sm:col-span-2">
            <TextInput
              id="addressLine2"
              name="addressLine2"
              defaultValue={organization.address_line_2 ?? ""}
            />
          </Field>
          <Field label="City" htmlFor="city">
            <TextInput id="city" name="city" defaultValue={organization.city ?? ""} />
          </Field>
          <Field label="State" htmlFor="state">
            <TextInput id="state" name="state" defaultValue={organization.state ?? ""} />
          </Field>
          <Field label="Pincode" htmlFor="pincode">
            <TextInput id="pincode" name="pincode" defaultValue={organization.pincode ?? ""} />
          </Field>
        </div>
      </Section>

      <Section title="GST & PAN">
        <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <input
            type="checkbox"
            name="gstEnabled"
            checked={gstEnabled}
            onChange={(e) => setGstEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-border-strong text-primary focus:ring-primary"
          />
          This business is GST registered
        </label>
        <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", !gstEnabled && "opacity-50")}>
          <Field label="GSTIN" htmlFor="gstin">
            <TextInput
              id="gstin"
              name="gstin"
              defaultValue={organization.gstin ?? ""}
              disabled={!gstEnabled}
              placeholder="22AAAAA0000A1Z5"
              className="uppercase"
            />
          </Field>
          <Field label="PAN" htmlFor="pan">
            <TextInput
              id="pan"
              name="pan"
              defaultValue={organization.pan ?? ""}
              placeholder="AAAAA0000A"
              className="uppercase"
            />
          </Field>
        </div>
      </Section>

      <Section title="Bank & UPI details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Account holder name" htmlFor="bankAccountName">
            <TextInput
              id="bankAccountName"
              name="bankAccountName"
              defaultValue={organization.bank_account_name ?? ""}
            />
          </Field>
          <Field label="Bank name" htmlFor="bankName">
            <TextInput
              id="bankName"
              name="bankName"
              defaultValue={organization.bank_name ?? ""}
            />
          </Field>
          <Field label="Account number" htmlFor="bankAccountNumber">
            <TextInput
              id="bankAccountNumber"
              name="bankAccountNumber"
              defaultValue={organization.bank_account_number ?? ""}
            />
          </Field>
          <Field label="IFSC" htmlFor="bankIfsc">
            <TextInput
              id="bankIfsc"
              name="bankIfsc"
              defaultValue={organization.bank_ifsc ?? ""}
              className="uppercase"
            />
          </Field>
          <Field label="UPI ID" htmlFor="upiId">
            <TextInput id="upiId" name="upiId" defaultValue={organization.upi_id ?? ""} />
          </Field>
        </div>
      </Section>

      <Section title="Numbering & terms">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Invoice prefix" htmlFor="invoicePrefix">
            <TextInput
              id="invoicePrefix"
              name="invoicePrefix"
              defaultValue={organization.invoice_prefix}
              required
            />
          </Field>
          <Field label="Quotation prefix" htmlFor="quotationPrefix">
            <TextInput
              id="quotationPrefix"
              name="quotationPrefix"
              defaultValue={organization.quotation_prefix}
              required
            />
          </Field>
        </div>
        <Field label="Default payment terms" htmlFor="defaultPaymentTerms">
          <textarea
            id="defaultPaymentTerms"
            name="defaultPaymentTerms"
            rows={3}
            defaultValue={organization.default_payment_terms ?? ""}
            placeholder="e.g. 50% advance, balance on delivery. Payment due within 7 days of invoice."
            className="w-full rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </Field>
      </Section>

      <FormMessage error={state.error} success={state.message} />
      <div>
        <SubmitButton pendingText="Saving…" className="w-auto px-6">
          Save changes
        </SubmitButton>
      </div>
    </form>
  );
}
