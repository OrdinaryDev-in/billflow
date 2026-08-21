import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireOrganization } from "@/lib/organizations/require";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { QuotationDetailsForm } from "./quotation-details-form";
import { QuotationItemsEditor } from "./quotation-items-editor";
import { QuotationActions } from "./quotation-actions";
import { ApprovalHistory } from "./approval-history";

export const metadata: Metadata = { title: "Quotation" };

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await requireOrganization();
  const supabase = await createClient();

  const { data: quotation } = await supabase
    .from("quotations")
    .select("*, quotation_items(*), quotation_approval_events(*)")
    .eq("id", id)
    .eq("organization_id", organization.id)
    .single();

  if (!quotation) notFound();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("organization_id", organization.id)
    .order("name");

  const readOnly = !["draft"].includes(quotation.status);
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/q/${quotation.public_token}`;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">
              {quotation.quotation_number}
            </h1>
            <StatusBadge status={quotation.status} />
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {readOnly
              ? "This quotation has been sent — details and line items are locked. Duplicate it to make changes."
              : "Draft — fill in details and line items, then mark as sent."}
          </p>
        </div>
        <QuotationActions
          quotationId={quotation.id}
          status={quotation.status}
          publicUrl={publicUrl}
          hasProject={!!quotation.project_id}
        />
      </div>

      <QuotationDetailsForm quotation={quotation} clients={clients ?? []} readOnly={readOnly} />
      <QuotationItemsEditor
        quotationId={quotation.id}
        currency={quotation.currency}
        initialItems={quotation.quotation_items ?? []}
        readOnly={readOnly}
      />
      {quotation.quotation_approval_events && quotation.quotation_approval_events.length > 0 && (
        <ApprovalHistory events={quotation.quotation_approval_events} />
      )}
    </div>
  );
}
