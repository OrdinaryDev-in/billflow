import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";

type Client = SupabaseClient<Database>;

export type ActivityEntityType =
  | "client"
  | "quotation"
  | "project"
  | "invoice"
  | "payment"
  | "recurring_schedule";

/**
 * Records an entry in activity_logs for the dashboard's "Recent activity"
 * feed. Best-effort: failures are swallowed (logged to console) rather than
 * failing the calling mutation — activity history should never block a
 * user's actual action.
 */
export async function logActivity(
  supabase: Client,
  params: {
    organizationId: string;
    actorUserId?: string | null;
    entityType: ActivityEntityType;
    entityId: string;
    action: string;
    metadata?: Record<string, unknown>;
  },
) {
  let actorUserId = params.actorUserId;
  if (actorUserId === undefined) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    actorUserId = user?.id ?? null;
  }

  const { error } = await supabase.from("activity_logs").insert({
    organization_id: params.organizationId,
    actor_user_id: actorUserId,
    entity_type: params.entityType,
    entity_id: params.entityId,
    action: params.action,
    metadata: (params.metadata ?? {}) as Json,
  });

  if (error) {
    console.error("logActivity failed", { params, error });
  }
}
