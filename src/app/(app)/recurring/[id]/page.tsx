import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOrganization } from "@/lib/organizations/require";
import { createClient } from "@/lib/supabase/server";
import { updateScheduleDetails } from "@/actions/recurring";
import { formatCurrency } from "@/lib/calculations/quotation";
import { StatusBadge } from "@/components/status-badge";
import { ScheduleDetailsForm } from "../schedule-details-form";
import { ScheduleTemplateEditor } from "./schedule-template-editor";
import { ScheduleActions } from "./schedule-actions";
import type { RecurringTemplateInput } from "@/lib/validation/recurring";

export const metadata: Metadata = { title: "Recurring schedule" };

export default async function ScheduleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await requireOrganization();
  const supabase = await createClient();

  const { data: schedule } = await supabase
    .from("recurring_invoice_schedules")
    .select("*")
    .eq("id", id)
    .eq("organization_id", organization.id)
    .single();

  if (!schedule) notFound();

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

  const { data: generatedInvoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, status, grand_total, currency, issue_date")
    .eq("recurring_schedule_id", schedule.id)
    .order("issue_date", { ascending: false });

  const readOnly = schedule.status === "ended";
  const template = schedule.template_data as unknown as RecurringTemplateInput;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">{schedule.name}</h1>
            <StatusBadge status={schedule.status} />
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {schedule.status === "active" &&
              `Next invoice on ${new Date(schedule.next_run_at).toLocaleDateString("en-IN")}`}
            {schedule.status === "paused" && "Paused — won't generate invoices until resumed."}
            {schedule.status === "ended" && "Ended — this schedule is locked."}
          </p>
        </div>
        <ScheduleActions scheduleId={schedule.id} status={schedule.status} />
      </div>

      <ScheduleDetailsForm
        action={updateScheduleDetails.bind(null, schedule.id)}
        clients={clients ?? []}
        projects={projects ?? []}
        schedule={schedule}
        readOnly={readOnly}
        submitLabel="Save changes"
      />

      <ScheduleTemplateEditor
        scheduleId={schedule.id}
        currency={schedule.currency}
        template={template}
        readOnly={readOnly}
      />

      <div className="rounded-lg border border-border-default bg-surface shadow-sm">
        <div className="border-b border-border-default px-6 py-4">
          <h2 className="text-sm font-semibold text-text-primary">Generated invoices</h2>
        </div>
        {generatedInvoices && generatedInvoices.length > 0 ? (
          <ul className="divide-y divide-border-default">
            {generatedInvoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="text-sm font-medium text-text-primary hover:text-primary"
                  >
                    {inv.invoice_number}
                  </Link>
                  <p className="text-xs text-text-tertiary">{inv.issue_date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={inv.status} />
                  <span className="text-sm font-medium tabular-nums text-text-primary">
                    {formatCurrency(inv.grand_total, inv.currency)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-8 text-center text-sm text-text-secondary">
            No invoices generated yet.
          </p>
        )}
      </div>
    </div>
  );
}
