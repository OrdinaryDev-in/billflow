import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateInvoiceForSchedule } from "@/lib/recurring/generate";

/** Constant-time comparison so a byte-by-byte timing attack can't help an
 * attacker recover CRON_SECRET one character at a time. */
function isAuthorized(authHeader: string | null, expected: string): boolean {
  const provided = authHeader ?? "";
  const expectedHeader = `Bearer ${expected}`;
  const a = Buffer.from(provided);
  const b = Buffer.from(expectedHeader);
  // timingSafeEqual throws on length mismatch, so compare lengths first —
  // that leaks only the length of the (fixed-format) header, not the secret.
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Scheduled entrypoint: generates invoices for every active recurring
 * schedule whose next_run_at has passed. Triggered daily by Vercel Cron
 * (see vercel.json), which calls this route with GET and an
 * `Authorization: Bearer $CRON_SECRET` header auto-injected by Vercel.
 * POST is also exposed for manual/local triggering with the same secret.
 *
 * Each schedule's own next_run_at check inside generateInvoiceForSchedule
 * makes this endpoint safe to call more than once for the same day.
 */
async function handleRecurringInvoicesJob(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  if (!isAuthorized(authHeader, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: dueSchedules, error } = await supabase
    .from("recurring_invoice_schedules")
    .select("id")
    .eq("status", "active")
    .lte("next_run_at", new Date().toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = [];
  for (const schedule of dueSchedules ?? []) {
    try {
      const result = await generateInvoiceForSchedule(supabase, schedule.id);
      results.push({ scheduleId: schedule.id, ...result });
    } catch (err) {
      results.push({
        scheduleId: schedule.id,
        created: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}

export const GET = handleRecurringInvoicesJob;
export const POST = handleRecurringInvoicesJob;
