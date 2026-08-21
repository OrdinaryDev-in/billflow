import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/calculations/quotation";
import { taxTypeLabel, type TaxType } from "@/lib/calculations/invoice";
import { StatusBadge } from "@/components/status-badge";
import { effectiveInvoiceStatus } from "@/lib/calculations/invoice-status";

export const metadata: Metadata = { title: "Invoice" };

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      "*, invoice_items(*), clients(name, email), organizations(name, logo_path, email, phone, gstin, address_line_1, address_line_2, city, state, pincode, bank_account_name, bank_account_number, bank_ifsc, bank_name, upi_id)",
    )
    .eq("public_token", token)
    .single();

  if (!invoice) notFound();

  if (invoice.status === "sent") {
    await supabase
      .from("invoices")
      .update({ status: "viewed", viewed_at: new Date().toISOString() })
      .eq("id", invoice.id);
  }

  const organization = invoice.organizations;
  const client = invoice.clients;
  const items = (invoice.invoice_items ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const status = effectiveInvoiceStatus(invoice.status, invoice.due_date);

  return (
    <div className="min-h-screen bg-page px-4 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex items-center justify-between rounded-lg border border-border-default bg-surface p-6 shadow-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
              Invoice
            </p>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">{invoice.invoice_number}</h1>
              <StatusBadge status={status} />
            </div>
          </div>
          <p className="text-right text-sm text-text-secondary">
            {organization?.name}
            <br />
            {invoice.issue_date}
            {invoice.due_date && <> · due {invoice.due_date}</>}
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 rounded-lg border border-border-default bg-surface p-6 shadow-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">From</p>
            <p className="mt-1 text-sm text-text-primary">{organization?.name}</p>
            {organization?.address_line_1 && (
              <p className="text-sm text-text-secondary">{organization.address_line_1}</p>
            )}
            {organization?.gstin && (
              <p className="text-sm text-text-secondary">GSTIN: {organization.gstin}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">To</p>
            <p className="mt-1 text-sm text-text-primary">{client?.name}</p>
            {client?.email && <p className="text-sm text-text-secondary">{client.email}</p>}
            {invoice.po_number && (
              <p className="text-sm text-text-secondary">PO: {invoice.po_number}</p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-border-default bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-default bg-surface-subtle text-xs font-medium uppercase tracking-wide text-text-tertiary">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Unit price</th>
                <th className="px-4 py-3 text-right">Tax</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-text-primary">{item.description}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                    {formatCurrency(item.unit_price, invoice.currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-text-tertiary">
                    {item.tax_rate > 0
                      ? `${item.tax_rate}% ${taxTypeLabel((item.tax_type as TaxType) ?? "none")}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-text-primary">
                    {formatCurrency(item.line_total, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-col gap-1 border-t border-border-default px-6 py-4">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Subtotal</span>
              <span className="tabular-nums">
                {formatCurrency(invoice.subtotal, invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Discount</span>
              <span className="tabular-nums">
                -{formatCurrency(invoice.discount_total, invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Tax</span>
              <span className="tabular-nums">
                {formatCurrency(invoice.tax_total, invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border-default pt-2 text-base font-semibold text-text-primary">
              <span>Total</span>
              <span className="tabular-nums">
                {formatCurrency(invoice.grand_total, invoice.currency)}
              </span>
            </div>
            {invoice.amount_paid > 0 && (
              <>
                <div className="flex justify-between text-sm text-success">
                  <span>Paid</span>
                  <span className="tabular-nums">
                    -{formatCurrency(invoice.amount_paid, invoice.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-text-primary">
                  <span>Balance due</span>
                  <span className="tabular-nums">
                    {formatCurrency(invoice.balance_due, invoice.currency)}
                  </span>
                </div>
              </>
            )}
          </div>
        </section>

        {invoice.balance_due > 0 && (organization?.bank_account_number || organization?.upi_id) && (
          <section className="rounded-lg border border-border-default bg-surface p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-text-primary">Payment details</h2>
            <div className="mt-2 grid grid-cols-1 gap-4 text-sm text-text-secondary sm:grid-cols-2">
              {organization?.bank_account_number && (
                <div>
                  <p className="font-medium text-text-primary">Bank transfer</p>
                  <p>{organization.bank_account_name}</p>
                  <p>{organization.bank_name}</p>
                  <p>A/C: {organization.bank_account_number}</p>
                  <p>IFSC: {organization.bank_ifsc}</p>
                </div>
              )}
              {organization?.upi_id && (
                <div>
                  <p className="font-medium text-text-primary">UPI</p>
                  <p>{organization.upi_id}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {invoice.notes && (
          <section className="rounded-lg border border-border-default bg-surface p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-text-primary">Notes</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{invoice.notes}</p>
          </section>
        )}
        {invoice.terms && (
          <section className="rounded-lg border border-border-default bg-surface p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-text-primary">Terms</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{invoice.terms}</p>
          </section>
        )}

        <p className="text-center text-xs text-text-tertiary">Sent via Billflow</p>
      </div>
    </div>
  );
}
