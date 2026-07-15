export interface RateLimiter {
  check(key: string): Promise<{
    success: boolean;
    remaining: number;
    resetTime: number;
  }>;
}
