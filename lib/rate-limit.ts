/**
 * Small in-memory sliding-window rate limiter.
 *
 * Good enough for a single Node process (self-hosted / local). On serverless
 * or multi-instance deployments, replace `hit()` with Upstash Redis or
 * `@vercel/kv` — the call signature is deliberately the same.
 */

type Bucket = { hits: number[]; blockedUntil?: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

export interface LimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number;
  limit: number;
}

export function hit(
  key: string,
  { limit = 10, windowMs = 60_000, blockMs = 0 }: { limit?: number; windowMs?: number; blockMs?: number } = {},
): LimitResult {
  const now = Date.now();
  if (buckets.size > MAX_KEYS) buckets.clear();

  const bucket = buckets.get(key) ?? { hits: [] };

  if (bucket.blockedUntil && bucket.blockedUntil > now) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((bucket.blockedUntil - now) / 1000), limit };
  }

  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    if (blockMs > 0) bucket.blockedUntil = now + blockMs;
    buckets.set(key, bucket);
    const retry = blockMs > 0 ? blockMs : windowMs - (now - bucket.hits[0]);
    return { ok: false, remaining: 0, retryAfter: Math.max(1, Math.ceil(retry / 1000)), limit };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { ok: true, remaining: limit - bucket.hits.length, retryAfter: 0, limit };
}

export function clientIp(req: Request): string {
  const headers = req.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "local"
  );
}
