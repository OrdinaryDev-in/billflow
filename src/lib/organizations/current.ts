import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth";
import type { Tables } from "@/types/database";

export const CURRENT_ORG_COOKIE = "billflow-org-id";

/**
 * Resolves the organization the current user is acting in: the org named
 * by the `billflow-org-id` cookie if they're still a member of it,
 * otherwise their first membership (ordered by join date). Returns null if
 * the user has no organizations yet (send them to /onboarding).
 *
 * Wrapped in React's `cache()` so the (app) layout and the page it wraps
 * — both of which need the current org — share one lookup per request
 * instead of re-querying membership + org rows twice per navigation.
 *
 * Fetches memberships joined with their organization row in a single
 * round trip (instead of a memberships query followed by a separate
 * organization query) since each Supabase round trip costs 100s of ms.
 */
export const getCurrentOrganization = cache(
  async (): Promise<Tables<"organizations"> | null> => {
    const user = await getAuthUser();
    if (!user) return null;

    const supabase = await createClient();
    const cookieStore = await cookies();
    const preferredOrgId = cookieStore.get(CURRENT_ORG_COOKIE)?.value;

    const { data: memberships } = await supabase
      .from("organization_members")
      .select("organization_id, created_at, organizations(*)")
      .order("created_at", { ascending: true });

    if (!memberships || memberships.length === 0) return null;

    const target =
      (preferredOrgId && memberships.find((m) => m.organization_id === preferredOrgId)) ||
      memberships[0];

    return target.organizations as Tables<"organizations"> | null;
  },
);
