import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Privileged Supabase client using the service role key.
 *
 * SECURITY: This bypasses Row Level Security entirely. Never import this
 * from a Client Component and never send its output directly to the
 * browser without re-checking authorization yourself. Use only for trusted
 * server-side operations (e.g. webhook processing, scheduled jobs).
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
