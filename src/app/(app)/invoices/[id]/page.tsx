import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireOrganization } from "@/lib/organizations/require";
import { createClient } from "@/lib/supabase/server";
import { determineTaxType } from "@/lib/calculations/invoice";
import { effectiveInvoiceStatus } from "@/lib/calculations/invoice-status";
import { formatCurrency } from "@/lib/calculations/quotation";
import { StatusBadge } from "@/components/status-badge";
import { InvoiceDetailsForm } from "./invoice-details-form";
import { InvoiceItemsEditor } from "./invoice-items-editor";
import { InvoiceActions } from "./invoice-actions";
import { PaymentsPanel } from "./payments-panel";

export const metadata: Metadata = { title: "Invoice" };

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await requireOrganization();
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, invoice_items(*), payments(*), clients(state)")
    .eq("id", id)
    .eq("organization_id", organization.id)
    .single();

  if (!invoice) notFound();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("organization_id", organization.id)
    .order("name");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("organization_id", organization.id)
    .order("name");

  const readOnly = invoice.status !== "draft";
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/i/${invoice.public_token}`;
  const status = effectiveInvoiceStatus(invoice.status, invoice.due_date);

  const defaultTaxType = determineTaxType({
    gstEnabled: organization.gst_enabled,
    organizationState: organization.state,
    clientState: (invoice.clients as unknown as { state: string | null } | null)?.state,
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">{invoice.invoice_number}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {readOnly
              ? "This invoice has been sent — details and line items are locked."
              : "Draft — fill in details and line items, then mark as sent."}
          </p>
        </div>
        <InvoiceActions invoiceId={invoice.id} status={invoice.status} publicUrl={publicUrl} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total", value: invoice.grand_total },
          { label: "Paid", value: invoice.amount_paid },
          { label: "Balance due", value: invoice.balance_due },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border-default bg-surface p-4 shadow-sm">
            <p className="text-xs font-medium text-text-secondary">{s.label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-text-primary">
              {formatCurrency(s.value, invoice.currency)}
            </p>
          </div>
        ))}
      </div>

      <InvoiceDetailsForm
        invoice={invoice}
        clients={clients ?? []}
        projects={projects ?? []}
        readOnly={readOnly}
      />
      <InvoiceItemsEditor
        invoiceId={invoice.id}
        currency={invoice.currency}
        initialItems={invoice.invoice_items ?? []}
        defaultTaxType={defaultTaxType}
        readOnly={readOnly}
      />
      {!readOnly ? null : (
        <PaymentsPanel
          invoiceId={invoice.id}
          organizationId={organization.id}
          currency={invoice.currency}
          balanceDue={invoice.balance_due}
          payments={invoice.payments ?? []}
          disabled={invoice.status === "cancelled"}
        />
      )}
    </div>
  );
}
