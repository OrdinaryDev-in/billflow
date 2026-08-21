import type { Metadata } from "next";
import Link from "next/link";
import { requireOrganization } from "@/lib/organizations/require";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Clients" };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const organization = await requireOrganization();
  const { q, status = "active" } = await searchParams;

  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select("id, name, type, contact_name, email, phone, city, status")
    .eq("organization_id", organization.id)
    .order("name", { ascending: true });

  if (status !== "all") {
    query = query.eq("status", status);
  }
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data: clients, error } = await query;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Clients</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Companies and individuals you send quotations and invoices to.
          </p>
        </div>
        <Link
          href="/clients/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover"
        >
          New client
        </Link>
      </div>

      <form className="flex items-center gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search clients…"
          className="w-full max-w-xs rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All</option>
        </select>
        <button
          type="submit"
          className="rounded-md border border-border-default px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-subtle"
        >
          Filter
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-border-default bg-surface shadow-sm">
        {error && <p className="p-6 text-sm text-danger">{error.message}</p>}

        {!error && clients && clients.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="text-sm font-medium text-text-primary">No clients yet</p>
            <p className="text-sm text-text-secondary">
              Add your first client to start creating quotations.
            </p>
            <Link
              href="/clients/new"
              className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-primary-hover"
            >
              New client
            </Link>
          </div>
        )}

        {!error && clients && clients.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-default bg-surface-subtle text-xs font-medium uppercase tracking-wide text-text-tertiary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-surface-subtle">
                  <td className="px-4 py-3">
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium text-text-primary hover:text-primary"
                    >
                      {client.name}
                    </Link>
                    <p className="text-xs text-text-tertiary">
                      {client.type === "company" ? "Company" : "Individual"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {client.contact_name || client.email || client.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{client.city || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        client.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-surface-subtle text-text-tertiary",
                      )}
                    >
                      {client.status === "active" ? "Active" : "Archived"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
