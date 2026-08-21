import type { Metadata } from "next";
import { requireOrganization } from "@/lib/organizations/require";
import { BusinessSettingsForm } from "./business-settings-form";

export const metadata: Metadata = { title: "Business settings" };

export default async function SettingsPage() {
  const organization = await requireOrganization();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Business settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          This information appears on your quotations and invoices.
        </p>
      </div>
      <BusinessSettingsForm organization={organization} />
    </div>
  );
}
