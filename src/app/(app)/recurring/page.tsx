import type { Metadata } from "next";
import Link from "next/link";
import { requireOrganization } from "@/lib/organizations/require";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { FREQUENCY_LABELS, type ScheduleFrequency } from "@/lib/calculations/schedule";

export const metadata: Metadata = { title: "Recurring invoices" };

export default async function RecurringPage() {
  const organization = await requireOrganization();
  const supabase = await createClient();

  const { data: schedules, error } = await supabase
    .from("recurring_invoice_schedules")
    .select("id, name, frequency, status, next_run_at, clients(name)")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Recurring invoices</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Retainers, maintenance and AMC contracts that bill automatically.
          </p>
        </div>
        <Link
          href="/recurring/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover"
        >
          New schedule
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-default bg-surface shadow-sm">
        {error && <p className="p-6 text-sm text-danger">{error.message}</p>}

        {!error && schedules && schedules.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="text-sm font-medium text-text-primary">No recurring schedules yet</p>
            <p className="text-sm text-text-secondary">
              Set one up for a retainer or maintenance contract.
            </p>
            <Link
              href="/recurring/new"
              className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-primary-hover"
            >
              New schedule
            </Link>
          </div>
        )}

        {!error && schedules && schedules.length > 0 && (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-default bg-surface-subtle text-xs font-medium uppercase tracking-wide text-text-tertiary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3">Next run</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {schedules.map((s) => (
                <tr key={s.id} className="hover:bg-surface-subtle">
                  <td className="px-4 py-3">
                    <Link
                      href={`/recurring/${s.id}`}
                      className="font-medium text-text-primary hover:text-primary"
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {(s.clients as unknown as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {FREQUENCY_LABELS[s.frequency as ScheduleFrequency] ?? s.frequency}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {s.status === "active" ? new Date(s.next_run_at).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
