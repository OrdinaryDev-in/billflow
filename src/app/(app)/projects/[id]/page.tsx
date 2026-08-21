import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOrganization } from "@/lib/organizations/require";
import { createClient } from "@/lib/supabase/server";
import { updateProject } from "@/actions/projects";
import { formatCurrency } from "@/lib/calculations/quotation";
import { ProjectForm } from "../project-form";
import { ProjectStatusControl } from "./project-status-control";
import { MilestonesManager } from "./milestones-manager";

export const metadata: Metadata = { title: "Project" };

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await requireOrganization();
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*, milestones(*)")
    .eq("id", id)
    .eq("organization_id", organization.id)
    .single();

  if (!project) notFound();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("organization_id", organization.id)
    .order("name");

  const { data: invoiceAggregates } = await supabase
    .from("invoices")
    .select("grand_total, amount_paid")
    .eq("project_id", project.id);

  const invoicedValue = (invoiceAggregates ?? []).reduce((sum, i) => sum + i.grand_total, 0);
  const paidValue = (invoiceAggregates ?? []).reduce((sum, i) => sum + i.amount_paid, 0);
  const outstandingValue = invoicedValue - paidValue;
  const remainingToInvoice = project.contract_value - invoicedValue;

  const milestones = (project.milestones ?? []).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{project.name}</h1>
          {project.source_quotation_id && (
            <Link
              href={`/quotations/${project.source_quotation_id}`}
              className="mt-1 inline-block text-sm text-primary hover:text-primary-hover"
            >
              View source quotation
            </Link>
          )}
        </div>
        <ProjectStatusControl projectId={project.id} status={project.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Contract value", value: project.contract_value },
          { label: "Invoiced", value: invoicedValue },
          { label: "Paid", value: paidValue },
          { label: "Outstanding", value: outstandingValue },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border-default bg-surface p-4 shadow-sm"
          >
            <p className="text-xs font-medium text-text-secondary">{stat.label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-text-primary">
              {formatCurrency(stat.value, project.currency)}
            </p>
          </div>
        ))}
      </div>
      {remainingToInvoice > 0 && (
        <p className="text-sm text-text-secondary">
          {formatCurrency(remainingToInvoice, project.currency)} remaining to invoice against the
          contract value.
        </p>
      )}

      <ProjectForm
        action={updateProject.bind(null, project.id)}
        clients={clients ?? []}
        project={project}
        submitLabel="Save changes"
      />

      {project.billing_type === "milestone" && (
        <MilestonesManager projectId={project.id} milestones={milestones} currency={project.currency} />
      )}
    </div>
  );
}
