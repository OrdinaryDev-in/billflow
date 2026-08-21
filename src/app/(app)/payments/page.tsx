import type { Metadata } from "next";
import Link from "next/link";
import { requireOrganization } from "@/lib/organizations/require";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/calculations/quotation";

export const metadata: Metadata = { title: "Payments" };

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bank transfer",
  upi: "UPI",
  razorpay: "Razorpay",
  cash: "Cash",
  other: "Other",
};

export default async function PaymentsPage() {
  const organization = await requireOrganization();
  const supabase = await createClient();

  const { data: payments, error } = await supabase
    .from("payments")
    .select("id, amount, currency, payment_method, payment_reference, paid_at, invoices(id, invoice_number, clients(name))")
    .eq("organization_id", organization.id)
    .order("paid_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Payments</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Every payment recorded against your invoices.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-default bg-surface shadow-sm">
        {error && <p className="p-6 text-sm text-danger">{error.message}</p>}

        {!error && payments && payments.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="text-sm font-medium text-text-primary">No payments recorded yet</p>
            <p className="text-sm text-text-secondary">
              Record a payment from an invoice&apos;s detail page.
            </p>
          </div>
        )}

        {!error && payments && payments.length > 0 && (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-default bg-surface-subtle text-xs font-medium uppercase tracking-wide text-text-tertiary">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {payments.map((p) => {
                const invoice = p.invoices as unknown as {
                  id: string;
                  invoice_number: string;
                  clients: { name: string } | null;
                } | null;
                return (
                  <tr key={p.id} className="hover:bg-surface-subtle">
                    <td className="px-4 py-3">
                      {invoice ? (
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="font-medium text-text-primary hover:text-primary"
                        >
                          {invoice.invoice_number}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {invoice?.clients?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {METHOD_LABELS[p.payment_method] ?? p.payment_method}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {new Date(p.paid_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-text-primary">
                      {formatCurrency(p.amount, p.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
