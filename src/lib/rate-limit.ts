/**
 * Simple per-IP in-memory rate limiter (fixed window).
 *
 * This is intentionally lightweight: state lives in a module-level Map, so it
 * only protects a single server instance and resets on restart. It is meant to
 * blunt casual abuse of the public write endpoints, not to be a distributed
 * rate limiter — swap in Redis/Upstash if you need cross-instance guarantees.
 */

type Bucket = {
  count: number;
  resetAt: number; // epoch ms when the window rolls over
};

const buckets = new Map<string, Bucket>();

// Occasionally evict stale buckets so the Map doesn't grow unbounded.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the current window resets (useful for Retry-After). */
  retryAfter: number;
};

/**
 * Records a hit for `key` and reports whether it is within the allowed budget.
 *
 * @param key      Identifier to bucket by (typically the client IP).
 * @param limit    Max requests allowed per window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;

  const retryAfter = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000));
  const remaining = Math.max(0, limit - bucket.count);
  const ok = bucket.count <= limit;

  return { ok, limit, remaining, retryAfter };
}

/**
 * Best-effort client IP from proxy headers, or `null` when none is resolvable.
 *
 * We prefer `x-real-ip` (a single value set by the immediate trusted proxy),
 * then the left-most `x-forwarded-for` entry. Behind a validating edge (Vercel,
 * or a proxy you control on DigitalOcean) these reflect the real client; if you
 * deploy behind an untrusted proxy, pin the trusted-IP header there.
 *
 * Returning `null` (rather than a literal "unknown") lets callers FAIL OPEN when
 * no IP is available — so a single local/dev request without forwarding headers
 * cannot 429 every visitor by sharing one bucket. Durable, cross-instance
 * limiting still needs Redis/Upstash (in-memory resets per instance/restart).
 */
export function getClientIp(request: Request): string | null {
  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return null;
}
