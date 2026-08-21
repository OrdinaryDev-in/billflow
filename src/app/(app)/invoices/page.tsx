import type { Metadata } from "next";
import Link from "next/link";
import { requireOrganization } from "@/lib/organizations/require";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/calculations/quotation";
import { StatusBadge } from "@/components/status-badge";
import { effectiveInvoiceStatus } from "@/lib/calculations/invoice-status";

export const metadata: Metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const organization = await requireOrganization();
  const supabase = await createClient();

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, status, due_date, grand_total, balance_due, currency, clients(name)",
    )
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Invoices</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Bill clients and track what&apos;s outstanding.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover"
        >
          New invoice
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-default bg-surface shadow-sm">
        {error && <p className="p-6 text-sm text-danger">{error.message}</p>}

        {!error && invoices && invoices.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="text-sm font-medium text-text-primary">No invoices yet</p>
            <p className="text-sm text-text-secondary">
              Create one manually, or generate it from an accepted quotation or milestone.
            </p>
            <Link
              href="/invoices/new"
              className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-primary-hover"
            >
              New invoice
            </Link>
          </div>
        )}

        {!error && invoices && invoices.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-default bg-surface-subtle text-xs font-medium uppercase tracking-wide text-text-tertiary">
              <tr>
                <th className="px-4 py-3">Number</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Due date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Balance due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-surface-subtle">
                  <td className="px-4 py-3">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="font-medium text-text-primary hover:text-primary"
                    >
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {(inv.clients as unknown as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{inv.due_date ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={effectiveInvoiceStatus(inv.status, inv.due_date)} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-text-primary">
                    {formatCurrency(inv.grand_total, inv.currency)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                    {formatCurrency(inv.balance_due, inv.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
