import argon2 from "argon2";

export type HashOptions = {
  type?: 0 | 1 | 2;
  memoryCost?: number;
  timeCost?: number;
  parallelism?: number;
};

const DEFAULTS: HashOptions = {
  type: 2,
  memoryCost: 65536,
  timeCost: 2,
  parallelism: 2,
};

export async function hashPassword(password: string, opts: HashOptions = {}): Promise<string> {
  return argon2.hash(password, { ...DEFAULTS, ...opts });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash || !password) return false;
  try {
    return argon2.verify(hash, password);
  } catch {
    return false;
  }
}
