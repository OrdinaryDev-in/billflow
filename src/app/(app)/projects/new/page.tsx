import type { Metadata } from "next";
import Link from "next/link";
import { requireOrganization } from "@/lib/organizations/require";
import { createClient } from "@/lib/supabase/server";
import { createProject } from "@/actions/projects";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const organization = await requireOrganization();
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("organization_id", organization.id)
    .eq("status", "active")
    .order("name");

  const action = createProject.bind(null, organization.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">New project</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Track a client engagement and its billing plan.
        </p>
      </div>

      {clients && clients.length === 0 ? (
        <div className="rounded-lg border border-border-default bg-surface p-6 text-center shadow-sm">
          <p className="text-sm text-text-secondary">You need a client first.</p>
          <Link
            href="/clients/new"
            className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-primary-hover"
          >
            Add a client
          </Link>
        </div>
      ) : (
        <ProjectForm action={action} clients={clients ?? []} submitLabel="Create project" />
      )}
    </div>
  );
}
