import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/auth";
import { getCurrentOrganization } from "@/lib/organizations/current";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();

  if (!user) redirect("/login");

  const organization = await getCurrentOrganization();

  return <AppShell organizationName={organization?.name ?? null}>{children}</AppShell>;
}
