type Fn = () => Promise<void>;

const locks = new Map<string, { expires: number; promise: Promise<void> }>();

function cleanExpired(): void {
  const now = Date.now();
  for (const [key, entry] of locks) {
    if (entry.expires < now) locks.delete(key);
  }
}

export class InMemoryRateLimiter {
  private limit: number;
  private windowMs: number;
  private hits = new Map<string, { count: number; resetTime: number }>();

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  async check(key: string): Promise<{ success: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const record = this.hits.get(key);

    if (record && now > record.resetTime) {
      this.hits.delete(key);
    }

    const current = this.hits.get(key) || { count: 0, resetTime: now + this.windowMs };

    if (current.count >= this.limit) {
      return {
        success: false,
        remaining: 0,
        resetTime: current.resetTime,
      };
    }

    current.count++;
    this.hits.set(key, current);

    return {
      success: true,
      remaining: this.limit - current.count,
      resetTime: current.resetTime,
    };
  }
}

export class InMemoryRateLimiterFactory {
  private static instance: InMemoryRateLimiterFactory;

  private constructor() {}

  static getInstance(): InMemoryRateLimiterFactory {
    if (!InMemoryRateLimiterFactory.instance) {
      InMemoryRateLimiterFactory.instance = new InMemoryRateLimiterFactory();
    }
    return InMemoryRateLimiterFactory.instance;
  }

  create(limit: number, windowMs: number): InMemoryRateLimiter {
    return new InMemoryRateLimiter(limit, windowMs);
  }
}

export const memoryLimiter = InMemoryRateLimiterFactory.getInstance();

export async function withLock(key: string, fn: Fn): Promise<void> {
  cleanExpired();

  const existing = locks.get(key);
  if (existing && existing.expires > Date.now()) {
    await existing.promise;
    return;
  }

  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  const entry = { expires: Date.now() + 5000, promise: promise as Promise<void> };
  locks.set(key, entry);

  try {
    await fn();
  } finally {
    locks.delete(key);
    resolve();
  }
}
