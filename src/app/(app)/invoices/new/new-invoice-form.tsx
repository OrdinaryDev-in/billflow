"use client";

import { useMemo, useState, useTransition } from "react";
import { createDraftInvoice } from "@/actions/invoices";
import { Field, Select } from "@/components/ui/field";

export function NewInvoiceForm({
  organizationId,
  clients,
  projects,
}: {
  organizationId: string;
  clients: { id: string; name: string }[];
  projects: { id: string; name: string; client_id: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [clientId, setClientId] = useState("");

  const clientProjects = useMemo(
    () => projects.filter((p) => p.client_id === clientId),
    [projects, clientId],
  );

  return (
    <form
      action={(formData: FormData) => {
        const selectedClientId = formData.get("clientId") as string;
        const projectId = (formData.get("projectId") as string) || undefined;
        startTransition(() => createDraftInvoice(organizationId, selectedClientId, projectId));
      }}
      className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface p-6 shadow-sm"
    >
      <Field label="Client" htmlFor="clientId">
        <Select
          id="clientId"
          name="clientId"
          required
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
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
      {clientProjects.length > 0 && (
        <Field label="Project (optional)" htmlFor="projectId">
          <Select id="projectId" name="projectId" defaultValue="">
            <option value="">No project</option>
            {clientProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <button
        type="submit"
        disabled={isPending || !clientId}
        className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating…" : "Create draft"}
      </button>
    </form>
  );
}
