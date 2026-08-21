import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireOrganization } from "@/lib/organizations/require";
import { createClient } from "@/lib/supabase/server";
import { updateClientRecord } from "@/actions/clients";
import { ClientForm } from "../client-form";
import { ArchiveClientButton } from "./archive-client-button";

export const metadata: Metadata = { title: "Edit client" };

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await requireOrganization();

  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("organization_id", organization.id)
    .single();

  if (!client) notFound();

  const action = updateClientRecord.bind(null, client.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{client.name}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Outstanding: ₹0 · No linked projects, quotations or invoices yet.
          </p>
        </div>
        <ArchiveClientButton clientId={client.id} status={client.status} />
      </div>
      <ClientForm action={action} client={client} submitLabel="Save changes" />
    </div>
  );
}
