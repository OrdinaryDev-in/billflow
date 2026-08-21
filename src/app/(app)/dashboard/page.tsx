import type { Metadata } from "next";
import { requireOrganization } from "@/lib/organizations/require";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const organization = await requireOrganization();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome to {organization.name}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Outstanding, overdue and pipeline metrics will show up here once you
          start creating quotations and invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Outstanding", value: "₹0" },
          { label: "Overdue", value: "₹0" },
          { label: "Paid this month", value: "₹0" },
          { label: "Quote pipeline", value: "₹0" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border-default bg-surface p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
