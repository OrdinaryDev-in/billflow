"use client";

import { useTransition } from "react";
import { createDraftQuotation } from "@/actions/quotations";
import { Field, Select } from "@/components/ui/field";
import { QUOTATION_TEMPLATES } from "@/lib/quotation-templates";

export function NewQuotationForm({
  organizationId,
  clients,
}: {
  organizationId: string;
  clients: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData: FormData) => {
        const clientId = formData.get("clientId") as string;
        const templateId = formData.get("templateId") as string;
        startTransition(() =>
          createDraftQuotation(organizationId, clientId, templateId || undefined),
        );
      }}
      className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface p-6 shadow-sm"
    >
      <Field label="Client" htmlFor="clientId">
        <Select id="clientId" name="clientId" required defaultValue="">
          <option value="" disabled>
            Select a client
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Template" htmlFor="templateId">
        <Select id="templateId" name="templateId" defaultValue="">
          <option value="">Blank quotation</option>
          {QUOTATION_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
        <p className="mt-1 text-xs text-text-tertiary">
          Pre-fills scope, deliverables, and sample line items — everything stays editable
          afterwards.
        </p>
      </Field>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating…" : "Create draft"}
      </button>
    </form>
  );
}
