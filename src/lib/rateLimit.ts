/**
 * Simple in-memory sliding-window rate limiter, keyed by client IP.
 *
 * Good enough to keep a public key-backed endpoint from being hammered from a
 * single host. Note: state is per server process — on serverless platforms
 * with many concurrent instances, put a shared limiter (or your platform's
 * built-in protection) in front for hard guarantees. Documented in README.
 */

const WINDOW_MS = 60_000;
const MAX_TRACKED_KEYS = 5_000;

const buckets = new Map<string, number[]>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  limitPerMinute: number,
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  // Opportunistic cleanup so the map can't grow without bound.
  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [k, times] of buckets) {
      const last = times[times.length - 1];
      if (last === undefined || last < cutoff) buckets.delete(k);
    }
    // Hard memory cap: under a flood of distinct (e.g. spoofed) keys, fail
    // open and reset rather than let the map grow unboundedly.
    if (buckets.size > MAX_TRACKED_KEYS * 2) {
      buckets.clear();
    }
  }

  const times = (buckets.get(key) ?? []).filter((t) => t > cutoff);
  if (times.length >= limitPerMinute) {
    const oldest = times[0] ?? now;
    buckets.set(key, times);
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((oldest + WINDOW_MS - now) / 1000),
      ),
    };
  }

  times.push(now);
  buckets.set(key, times);
  return {
    ok: true,
    remaining: limitPerMinute - times.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Best-effort client IP from proxy headers, falling back to the socket.
 * Uses the RIGHTMOST X-Forwarded-For entry — the one appended by the
 * nearest (trusted) proxy — because the leftmost values are client-supplied
 * and trivially spoofable to rotate around the rate limit.
 */
export function getClientIp(
  headers: Record<string, string | string[] | undefined>,
  socketAddress?: string,
): string {
  const forwarded = headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded.join(",") : forwarded;
  if (raw) {
    const parts = raw.split(",");
    const ip = parts[parts.length - 1]?.trim();
    if (ip) return ip;
  }
  const real = headers["x-real-ip"];
  const realIp = Array.isArray(real) ? real[0] : real;
  if (realIp) return realIp;
  return socketAddress ?? "unknown";
}
