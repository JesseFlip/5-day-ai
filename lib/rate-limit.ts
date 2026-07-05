import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

export async function checkRateLimit(
  userId: string,
  key: string,
  limit: number,
  windowSeconds = 3600
): Promise<{ success: boolean; retryAfter?: number }> {
  if (process.env.SKIP_ENV_VALIDATION === "true") return { success: true };
  try {
    const r = getRedis();
    const rkey = `rl:${key}:${userId}`;
    const count = await r.incr(rkey);
    if (count === 1) await r.expire(rkey, windowSeconds);
    if (count > limit) {
      const ttl = await r.ttl(rkey);
      return { success: false, retryAfter: ttl };
    }
    return { success: true };
  } catch {
    return { success: true }; // fail open
  }
}
