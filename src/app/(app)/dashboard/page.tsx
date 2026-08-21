import type { Metadata } from "next";
import Link from "next/link";
import { requireOrganization } from "@/lib/organizations/require";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/calculations/quotation";
import { describeActivity } from "@/lib/activity/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const organization = await requireOrganization();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { data: outstandingRows },
    { data: overdueRows },
    { data: paidRows },
    { data: pipelineRows },
    { data: upcomingDue },
    { data: recentPayments },
    { data: recentActivity },
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select("balance_due")
      .eq("organization_id", organization.id)
      .gt("balance_due", 0)
      .in("status", ["sent", "viewed", "partially_paid"]),
    supabase
      .from("invoices")
      .select("balance_due")
      .eq("organization_id", organization.id)
      .in("status", ["sent", "viewed", "partially_paid"])
      .lt("due_date", today),
    supabase
      .from("payments")
      .select("amount")
      .eq("organization_id", organization.id)
      .eq("status", "completed")
      .gte("paid_at", startOfMonth.toISOString()),
    supabase
      .from("quotations")
      .select("grand_total")
      .eq("organization_id", organization.id)
      .in("status", ["sent", "viewed"]),
    supabase
      .from("invoices")
      .select("id, invoice_number, due_date, balance_due, currency, clients(name)")
      .eq("organization_id", organization.id)
      .gt("balance_due", 0)
      .neq("status", "draft")
      .neq("status", "cancelled")
      .not("due_date", "is", null)
      .order("due_date", { ascending: true })
      .limit(5),
    supabase
      .from("payments")
      .select("id, amount, currency, paid_at, invoices(invoice_number, clients(name))")
      .eq("organization_id", organization.id)
      .order("paid_at", { ascending: false })
      .limit(5),
    supabase
      .from("activity_logs")
      .select("id, entity_type, action, created_at")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const outstanding = (outstandingRows ?? []).reduce((sum, r) => sum + r.balance_due, 0);
  const overdue = (overdueRows ?? []).reduce((sum, r) => sum + r.balance_due, 0);
  const paidThisMonth = (paidRows ?? []).reduce((sum, r) => sum + r.amount, 0);
  const quotePipeline = (pipelineRows ?? []).reduce((sum, r) => sum + r.grand_total, 0);

  const stats = [
    { label: "Outstanding", value: outstanding },
    { label: "Overdue", value: overdue },
    { label: "Paid this month", value: paidThisMonth },
    { label: "Quote pipeline", value: quotePipeline },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome to {organization.name}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Here&apos;s where things stand across quotes, invoices and payments.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border-default bg-surface p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">
              {formatCurrency(stat.value, organization.currency)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border-default bg-surface shadow-sm">
          <div className="border-b border-border-default px-5 py-3">
            <h2 className="text-sm font-semibold text-text-primary">Upcoming due invoices</h2>
          </div>
          {upcomingDue && upcomingDue.length > 0 ? (
            <ul className="divide-y divide-border-default">
              {upcomingDue.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="text-sm font-medium text-text-primary hover:text-primary"
                    >
                      {inv.invoice_number}
                    </Link>
                    <p className="text-xs text-text-tertiary">
                      {(inv.clients as unknown as { name: string } | null)?.name} · due{" "}
                      {inv.due_date}
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-text-primary">
                    {formatCurrency(inv.balance_due, inv.currency)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-text-secondary">
              Nothing due right now.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border-default bg-surface shadow-sm">
          <div className="border-b border-border-default px-5 py-3">
            <h2 className="text-sm font-semibold text-text-primary">Recent payments</h2>
          </div>
          {recentPayments && recentPayments.length > 0 ? (
            <ul className="divide-y divide-border-default">
              {recentPayments.map((p) => {
                const invoice = p.invoices as unknown as {
                  invoice_number: string;
                  clients: { name: string } | null;
                } | null;
                return (
                  <li key={p.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {invoice?.invoice_number ?? "—"}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {invoice?.clients?.name} ·{" "}
                        {new Date(p.paid_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <span className="text-sm font-medium tabular-nums text-success">
                      +{formatCurrency(p.amount, p.currency)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-text-secondary">
              No payments recorded yet.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border-default bg-surface shadow-sm">
        <div className="border-b border-border-default px-5 py-3">
          <h2 className="text-sm font-semibold text-text-primary">Recent activity</h2>
        </div>
        {recentActivity && recentActivity.length > 0 ? (
          <ul className="divide-y divide-border-default">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-text-primary">
                  {describeActivity(a.entity_type, a.action)}
                </span>
                <span className="text-xs text-text-tertiary">
                  {new Date(a.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-text-secondary">
            No activity yet — it&apos;ll show up here as you create and send documents.
          </p>
        )}
      </div>
    </div>
  );
}
