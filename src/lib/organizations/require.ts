import "server-only";
import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/organizations/current";
import type { Tables } from "@/types/database";

/** Resolves the current organization or redirects to onboarding. Use in
 * every (app) page except /onboarding itself. */
export async function requireOrganization(): Promise<Tables<"organizations">> {
  const organization = await getCurrentOrganization();
  if (!organization) redirect("/onboarding");
  return organization;
}
