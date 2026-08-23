"use client";

import { useState, useTransition } from "react";
import { sendQuotation, duplicateQuotation, deleteQuotation } from "@/actions/quotations";
import { convertQuotationToProject } from "@/actions/projects";
import { createInvoiceFromQuotation } from "@/actions/invoices";

export function QuotationActions({
  quotationId,
  status,
  publicUrl,
  hasProject,
}: {
  quotationId: string;
  status: string;
  publicUrl: string;
  hasProject: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(publicUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="rounded-md border border-border-default px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-subtle"
      >
        {copied ? "Link copied" : "Copy client link"}
      </button>
      <a
        href={publicUrl}
        target="_blank"
        rel="noreferrer"
        className="rounded-md border border-border-default px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-subtle"
      >
        Preview
      </a>
      <a
        href={`/api/quotations/${quotationId}/pdf`}
        target="_blank"
        rel="noreferrer"
        className="rounded-md border border-border-default px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-subtle"
      >
        Download PDF
      </a>
      {status === "draft" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => sendQuotation(quotationId))}
          className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-text-inverse hover:bg-primary-hover disabled:opacity-60"
        >
          {isPending ? "Sending…" : "Mark as sent"}
        </button>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => duplicateQuotation(quotationId))}
        className="rounded-md border border-border-default px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-subtle disabled:opacity-60"
      >
        Duplicate
      </button>
      {status === "accepted" && !hasProject && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => convertQuotationToProject(quotationId))}
          className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-text-inverse hover:bg-primary-hover disabled:opacity-60"
        >
          {isPending ? "Converting…" : "Convert to project"}
        </button>
      )}
      {status === "accepted" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => createInvoiceFromQuotation(quotationId))}
          className="rounded-md border border-border-default px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-subtle disabled:opacity-60"
        >
          Create invoice
        </button>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm(`Delete quotation permanently? This can't be undone.`)) {
            startTransition(() => deleteQuotation(quotationId));
          }
        }}
        className="rounded-md border border-border-default px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10 disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );
}
