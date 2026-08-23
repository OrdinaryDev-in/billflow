import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/calculations/quotation";
import { ApprovalActions } from "./approval-actions";

export const metadata: Metadata = { title: "Quotation" };

export default async function PublicQuotationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: quotation } = await supabase
    .from("quotations")
    .select(
      "*, quotation_items(*), clients(name, email), organizations(name, logo_path, email, phone, gstin, address_line_1, address_line_2, city, state, pincode, bank_account_name, bank_account_number, bank_ifsc, bank_name, upi_id)",
    )
    .eq("public_token", token)
    .single();

  if (!quotation) notFound();

  // First view: mark as viewed and log it, without blocking the render.
  if (quotation.status === "sent") {
    await supabase
      .from("quotations")
      .update({ status: "viewed", viewed_at: new Date().toISOString() })
      .eq("id", quotation.id);
    await supabase
      .from("quotation_approval_events")
      .insert({ quotation_id: quotation.id, action: "viewed" });
  }

  const organization = quotation.organizations;
  const client = quotation.clients;
  const items = (quotation.quotation_items ?? []).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const isDecided = ["accepted", "rejected", "changes_requested"].includes(quotation.status);

  return (
    <div className="min-h-screen bg-page px-4 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex items-center justify-between rounded-lg border border-border-default bg-surface p-6 shadow-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
              Quotation
            </p>
            <h1 className="text-xl font-bold text-text-primary">{quotation.quotation_number}</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary">
              {organization?.name}
              <br />
              {quotation.issue_date}
              {quotation.valid_until && <> · valid until {quotation.valid_until}</>}
            </p>
            <a
              href={`/api/public/quotation/${token}/pdf`}
              className="mt-2 inline-block rounded-md border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-subtle"
            >
              Download PDF
            </a>
          </div>
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
          </div>
        </section>

        {quotation.scope_of_work && (
          <Section title="Scope of work" content={quotation.scope_of_work} />
        )}
        {quotation.deliverables && (
          <Section title="Deliverables" content={quotation.deliverables} />
        )}

        <section className="overflow-hidden rounded-lg border border-border-default bg-surface shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-default bg-surface-subtle text-xs font-medium uppercase tracking-wide text-text-tertiary">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Unit price</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {items.map((item) =>
                item.type === "section" ? (
                  <tr key={item.id} className="bg-surface-subtle">
                    <td colSpan={4} className="px-4 py-2 text-sm font-semibold text-text-primary">
                      {item.title}
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="text-text-primary">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-text-tertiary">{item.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                      {formatCurrency(item.unit_price, quotation.currency)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-text-primary">
                      {formatCurrency(item.line_total, quotation.currency)}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
          </div>
          <div className="flex flex-col gap-1 border-t border-border-default px-6 py-4">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Subtotal</span>
              <span className="tabular-nums">
                {formatCurrency(quotation.subtotal, quotation.currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Discount</span>
              <span className="tabular-nums">
                -{formatCurrency(quotation.discount_total, quotation.currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Tax</span>
              <span className="tabular-nums">
                {formatCurrency(quotation.tax_total, quotation.currency)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border-default pt-2 text-base font-semibold text-text-primary">
              <span>Total</span>
              <span className="tabular-nums">
                {formatCurrency(quotation.grand_total, quotation.currency)}
              </span>
            </div>
          </div>
        </section>

        {quotation.terms && <Section title="Terms" content={quotation.terms} />}

        {!isDecided ? (
          <ApprovalActions token={token} />
        ) : (
          <div className="rounded-lg border border-border-default bg-surface p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-text-primary">
              {quotation.status === "accepted" && "You accepted this quotation."}
              {quotation.status === "rejected" && "You declined this quotation."}
              {quotation.status === "changes_requested" &&
                "You requested changes to this quotation."}
            </p>
          </div>
        )}

        <p className="text-center text-xs text-text-tertiary">
          Sent via Billflow
          {organization?.logo_path && (
            <Image
              src="/brand/billflow-icon-mono.svg"
              alt=""
              width={12}
              height={12}
              className="ml-1 inline-block opacity-50"
            />
          )}
        </p>
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <section className="rounded-lg border border-border-default bg-surface p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{content}</p>
    </section>
  );
}
