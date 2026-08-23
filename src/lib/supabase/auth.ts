import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { VERIFIED_USER_HEADER } from "@/lib/supabase/middleware";
import type { User } from "@supabase/supabase-js";

/**
 * Returns the signed-in user, or null. Wrapped in React's `cache()` so
 * every caller within a single request (the (app) layout, page-level
 * requireOrganization/getCurrentOrganization, etc.) shares one lookup
 * instead of each re-verifying the session independently.
 *
 * Every (app) route goes through the proxy in middleware.ts, which already
 * calls `supabase.auth.getUser()` and forwards the verified user as a
 * request header (see VERIFIED_USER_HEADER) — trusting it here avoids a
 * second network round trip to Supabase Auth on every render. Routes the
 * proxy doesn't cover (its matcher excludes /api, static assets, etc.) fall
 * back to calling Supabase directly.
 */
export const getAuthUser = cache(async (): Promise<User | null> => {
  const headerList = await headers();
  const verifiedUser = headerList.get(VERIFIED_USER_HEADER);
  if (verifiedUser) {
    try {
      return JSON.parse(verifiedUser) as User;
    } catch {
      // Fall through to a direct check if the header is somehow malformed.
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
