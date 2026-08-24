import "server-only";

/**
 * In-memory fixed-window rate limiter for unauthenticated/public routes.
 *
 * This is a best-effort stopgap: state lives in the lambda instance's
 * memory, so a burst spread across many cold-started instances isn't
 * caught by a single window. It still meaningfully slows down a script
 * hammering one endpoint from one place — the common case for accidental
 * loops and casual abuse. For durable, multi-instance-accurate limiting,
 * swap this for a shared store (e.g. Upstash Ratelimit backed by Redis).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so this map doesn't grow unbounded
// across the lifetime of a warm lambda instance.
const SWEEP_INTERVAL_MS = 5 * 60_000;
let lastSweep = 0;
function sweepExpired(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

/**
 * Allows `limit` calls per `windowSeconds` for a given key. Call once per
 * request with a key that identifies the caller + the resource being
 * protected (e.g. `${ip}:${token}`).
 */
export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  sweepExpired(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true };
}

/** Best-effort caller IP from standard proxy headers (Vercel sets these). */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
