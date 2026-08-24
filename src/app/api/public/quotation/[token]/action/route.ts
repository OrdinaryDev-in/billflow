import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { quotationApprovalSchema } from "@/lib/validation/quotations";
import { logActivity } from "@/lib/activity/log";
import { sendQuotationDecisionEmail } from "@/lib/email/send";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  // This route uses the service-role client (bypasses RLS) and is gated
  // only by the unguessable token, plus it writes DB rows and sends an
  // email — throttle per caller+token so a leaked token can't be hammered.
  const limited = rateLimit(`quotation-action:${getClientIp(request)}:${token}`, 5, 60);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

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
    .select("id, status, organization_id, quotation_number, organizations(email)")
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

  // Best-effort notification to the organization — never fails the request.
  await sendQuotationDecisionEmail({
    to: quotation.organizations?.email ?? null,
    quotationNumber: quotation.quotation_number,
    clientName,
    action,
    clientMessage,
    appUrl: `${process.env.NEXT_PUBLIC_APP_URL}/quotations/${quotation.id}`,
  }).catch((notifyError) => {
    console.error("sendQuotationDecisionEmail failed", notifyError);
  });

  return NextResponse.json({ ok: true });
}
