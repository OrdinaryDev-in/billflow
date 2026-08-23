import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOrganization } from "@/lib/organizations/require";
import { createClient } from "@/lib/supabase/server";
import { WorkItemsBoard } from "./work-items-board";

export const metadata: Metadata = { title: "Work" };

export default async function ProjectWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await requireOrganization();
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", id)
    .eq("organization_id", organization.id)
    .single();

  if (!project) notFound();

  const { data: workItems } = await supabase
    .from("work_items")
    .select("*")
    .eq("project_id", id)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href={`/projects/${id}`} className="text-sm text-primary hover:text-primary-hover">
          ← {project.name}
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">Work</h1>
      </div>

      <WorkItemsBoard
        organizationId={organization.id}
        projectId={id}
        initialItems={workItems ?? []}
      />
    </div>
  );
}
