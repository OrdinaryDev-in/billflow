import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Returns the signed-in user, or null. Wrapped in React's `cache()` so
 * every caller within a single request (the (app) layout, page-level
 * requireOrganization/getCurrentOrganization, etc.) shares one round trip
 * to Supabase Auth instead of each re-verifying the session independently.
 */
export const getAuthUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
