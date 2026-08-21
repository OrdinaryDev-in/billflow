import type { Metadata } from "next";
import Link from "next/link";
import { requireOrganization } from "@/lib/organizations/require";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/calculations/quotation";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = { title: "Quotations" };

export default async function QuotationsPage() {
  const organization = await requireOrganization();
  const supabase = await createClient();

  const { data: quotations, error } = await supabase
    .from("quotations")
    .select("id, quotation_number, status, grand_total, currency, issue_date, clients(name)")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Quotations</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Draft, send and track client proposals.
          </p>
        </div>
        <Link
          href="/quotations/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover"
        >
          New quotation
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-default bg-surface shadow-sm">
        {error && <p className="p-6 text-sm text-danger">{error.message}</p>}

        {!error && quotations && quotations.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="text-sm font-medium text-text-primary">No quotations yet</p>
            <p className="text-sm text-text-secondary">
              Create your first quotation to send to a client.
            </p>
            <Link
              href="/quotations/new"
              className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-primary-hover"
            >
              New quotation
            </Link>
          </div>
        )}

        {!error && quotations && quotations.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-default bg-surface-subtle text-xs font-medium uppercase tracking-wide text-text-tertiary">
              <tr>
                <th className="px-4 py-3">Number</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Issue date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-surface-subtle">
                  <td className="px-4 py-3">
                    <Link
                      href={`/quotations/${q.id}`}
                      className="font-medium text-text-primary hover:text-primary"
                    >
                      {q.quotation_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {(q.clients as unknown as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{q.issue_date}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={q.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-text-primary">
                    {formatCurrency(q.grand_total, q.currency)}
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
