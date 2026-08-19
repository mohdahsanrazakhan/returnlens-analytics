// Simple in-memory fixed-window rate limiter for the login endpoint (Section 3.1).
// Suitable for a single-instance demo deployment; swap for Redis in real production.

interface Bucket {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so this Map can't grow unbounded.
function sweep() {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  if (buckets.size > 5000) sweep();

  let bucket = buckets.get(identifier);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(identifier, bucket);
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: MAX_ATTEMPTS - bucket.count, resetAt: bucket.resetAt };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
