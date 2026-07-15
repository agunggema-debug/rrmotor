import { InMemoryRateLimiter, InMemoryRateLimiterFactory } from "./rate-limit/memory";
import { RedisRateLimiter } from "./rate-limit/redis";
import type { RateLimiter } from "./rate-limit/types";

const memoryLimiters = new Map<string, InMemoryRateLimiter>();

function getMemoryLimiter(key: string, maxRequests: number, windowMs: number): InMemoryRateLimiter {
  let limiter = memoryLimiters.get(key);
  if (!limiter) {
    limiter = InMemoryRateLimiterFactory.getInstance().create(maxRequests, windowMs);
    memoryLimiters.set(key, limiter);
  }
  return limiter;
}

let redisLimiterCache: { limit: number; windowMs: number; limiter: RedisRateLimiter } | null = null;

function getRedisLimiter(maxRequests: number, windowMs: number): RedisRateLimiter {
  if (redisLimiterCache && redisLimiterCache.limit === maxRequests && redisLimiterCache.windowMs === windowMs) {
    return redisLimiterCache.limiter;
  }
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN wajib diisi untuk mode Redis");
  }
  const limiter = new RedisRateLimiter(url, token, maxRequests, windowMs);
  redisLimiterCache = { limit: maxRequests, windowMs, limiter };
  return limiter;
}

function getLimiter(maxRequests: number, windowMs: number): RateLimiter {
  const useRedis = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  if (useRedis) {
    return getRedisLimiter(maxRequests, windowMs);
  }
  // For in-memory, we return a wrapper that picks the right per-key limiter
  return {
    check: (key: string) => getMemoryLimiter(key, maxRequests, windowMs).check(key),
  };
}

export async function rateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000
) {
  const limiter = getLimiter(maxRequests, windowMs);
  return limiter.check(key);
}

export function getClientIP(req: Request): string {
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}
