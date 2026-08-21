import type { Metadata } from "next";
import Link from "next/link";
import { requireOrganization } from "@/lib/organizations/require";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/calculations/quotation";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = { title: "Projects" };

const BILLING_TYPE_LABELS: Record<string, string> = {
  full: "Full payment",
  advance_balance: "Advance + balance",
  milestone: "Milestones",
  recurring: "Recurring",
};

export default async function ProjectsPage() {
  const organization = await requireOrganization();
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, status, billing_type, contract_value, currency, clients(name)")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Track contract value, billing type and progress per client engagement.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover"
        >
          New project
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-default bg-surface shadow-sm">
        {error && <p className="p-6 text-sm text-danger">{error.message}</p>}

        {!error && projects && projects.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="text-sm font-medium text-text-primary">No projects yet</p>
            <p className="text-sm text-text-secondary">
              Create one manually, or convert an accepted quotation.
            </p>
            <Link
              href="/projects/new"
              className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-primary-hover"
            >
              New project
            </Link>
          </div>
        )}

        {!error && projects && projects.length > 0 && (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-default bg-surface-subtle text-xs font-medium uppercase tracking-wide text-text-tertiary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Billing</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Contract value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-surface-subtle">
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${p.id}`}
                      className="font-medium text-text-primary hover:text-primary"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {(p.clients as unknown as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {BILLING_TYPE_LABELS[p.billing_type] ?? p.billing_type}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-text-primary">
                    {formatCurrency(p.contract_value, p.currency)}
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
