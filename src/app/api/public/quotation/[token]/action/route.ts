import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { quotationApprovalSchema } from "@/lib/validation/quotations";
import { logActivity } from "@/lib/activity/log";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const body = await request.json().catch(() => null);
  const parsed = quotationApprovalSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  const { data: quotation, error: fetchError } = await supabase
    .from("quotations")
    .select("id, status, organization_id, quotation_number")
    .eq("public_token", token)
    .single();

  if (fetchError || !quotation) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }

  if (["accepted", "rejected", "changes_requested"].includes(quotation.status)) {
    return NextResponse.json(
      { error: "This quotation has already been responded to." },
      { status: 409 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;

  const { action, clientName, clientMessage } = parsed.data;

  const { error: updateError } = await supabase
    .from("quotations")
    .update({ status: action })
    .eq("id", quotation.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { error: eventError } = await supabase.from("quotation_approval_events").insert({
    quotation_id: quotation.id,
    action,
    client_name: clientName,
    client_message: clientMessage || null,
    ip_address: ip,
  });

  if (eventError) {
    return NextResponse.json({ error: eventError.message }, { status: 500 });
  }

  await logActivity(supabase, {
    organizationId: quotation.organization_id,
    actorUserId: null,
    entityType: "quotation",
    entityId: quotation.id,
    action: `client_${action}`,
    metadata: { quotation_number: quotation.quotation_number, client_name: clientName },
  });

  return NextResponse.json({ ok: true });
}
