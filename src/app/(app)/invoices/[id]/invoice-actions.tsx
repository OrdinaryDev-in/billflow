"use client";

import { useState, useTransition } from "react";
import { sendInvoice, cancelInvoice } from "@/actions/invoices";

export function InvoiceActions({
  invoiceId,
  status,
  publicUrl,
}: {
  invoiceId: string;
  status: string;
  publicUrl: string;
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
        href={`/api/invoices/${invoiceId}/pdf`}
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
          onClick={() => startTransition(() => sendInvoice(invoiceId))}
          className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-text-inverse hover:bg-primary-hover disabled:opacity-60"
        >
          {isPending ? "Sending…" : "Mark as sent"}
        </button>
      )}
      {!["cancelled", "paid"].includes(status) && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (confirm("Cancel this invoice?")) {
              startTransition(() => cancelInvoice(invoiceId));
            }
          }}
          className="rounded-md border border-border-default px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10 disabled:opacity-60"
        >
          Cancel invoice
        </button>
      )}
    </div>
  );
}
