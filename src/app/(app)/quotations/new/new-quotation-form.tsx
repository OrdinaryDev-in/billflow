"use client";

import { useTransition } from "react";
import { createDraftQuotation } from "@/actions/quotations";
import { Field, Select } from "@/components/ui/field";

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
        startTransition(() => createDraftQuotation(organizationId, clientId));
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
