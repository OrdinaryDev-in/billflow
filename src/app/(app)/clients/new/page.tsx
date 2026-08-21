import type { Metadata } from "next";
import { requireOrganization } from "@/lib/organizations/require";
import { createClientRecord } from "@/actions/clients";
import { ClientForm } from "../client-form";

export const metadata: Metadata = { title: "New client" };

export default async function NewClientPage() {
  const organization = await requireOrganization();
  const action = createClientRecord.bind(null, organization.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">New client</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Add a company or individual to bill.
        </p>
      </div>
      <ClientForm action={action} submitLabel="Create client" />
    </div>
  );
}
