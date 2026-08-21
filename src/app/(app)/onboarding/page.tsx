import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getCurrentOrganization } from "@/lib/organizations/current";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Set up your business" };

export default async function OnboardingPage() {
  const organization = await getCurrentOrganization();
  if (organization) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center px-4 py-12">
      <Image
        src="/brand/billflow-logo-primary.svg"
        alt="Billflow"
        width={32}
        height={32}
        className="mb-6"
      />
      <div className="w-full max-w-sm rounded-lg border border-border-default bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-text-primary">Set up your business</h1>
        <p className="mt-1 text-sm text-text-secondary">
          This becomes the name on your quotations and invoices. You can add
          GST, bank and branding details afterwards in Settings.
        </p>
        <div className="mt-6">
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
