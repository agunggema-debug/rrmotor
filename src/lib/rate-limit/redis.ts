export class RedisRateLimiter {
  private baseUrl: string;
  private token: string;
  private limit: number;
  private windowMs: number;

  constructor(baseUrl: string, token: string, limit: number, windowMs: number) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.token = token;
    this.limit = limit;
    this.windowMs = windowMs;
  }

  async check(key: string): Promise<{ success: boolean; remaining: number; resetTime: number }> {
    const windowSeconds = Math.ceil(this.windowMs / 1000);
    const redisKey = `ratelimit:${key}`;

    const count = await this.incr(redisKey);
    if (count === 1) {
      await this.expire(redisKey, windowSeconds);
    }

    const ttl = await this.ttl(redisKey);
    const resetTime = ttl > 0 ? Date.now() + ttl * 1000 : Date.now() + this.windowMs;
    const remaining = Math.max(0, this.limit - count);

    return {
      success: count <= this.limit,
      remaining,
      resetTime,
    };
  }

  private async incr(key: string): Promise<number> {
    const res = await fetch(`${this.baseUrl}/incr/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: this.authHeaders(),
      body: "{}",
    });
    if (!res.ok) throw new Error(`Redis INCR failed: ${res.status}`);
    const data = (await res.json()) as { result: string | number };
    return typeof data.result === "number" ? data.result : Number(data.result);
  }

  private async expire(key: string, seconds: number): Promise<void> {
    const res = await fetch(`${this.baseUrl}/expire/${encodeURIComponent(key)}/${seconds}`, {
      method: "POST",
      headers: this.authHeaders(),
      body: "{}",
    });
    if (!res.ok) throw new Error(`Redis EXPIRE failed: ${res.status}`);
  }

  private async ttl(key: string): Promise<number> {
    const res = await fetch(`${this.baseUrl}/ttl/${encodeURIComponent(key)}`, {
      method: "GET",
      headers: this.authHeaders(),
    });
    if (!res.ok) return 0;
    const data = (await res.json()) as { result: string | number };
    return typeof data.result === "number" ? data.result : Number(data.result);
  }

  private authHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }
}
