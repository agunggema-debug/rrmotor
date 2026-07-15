// Session cookie helper — menggunakan Web Crypto (aman di Edge & Node).
// Token = base64(payload).signature, signature = HMAC-SHA256(secret, payload).

export type SessionPayload = {
  id: number;
  username: string;
  role: "ADMIN" | "MECHANIC" | "KASIR" | "CUSTOMER";
  userId?: number | null;
  exp: number; // epoch ms
};

const COOKIE = "rr_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  return secret;
}

function b64encode(input: ArrayBuffer | string): string {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCodePoint(b)));
  const encoded = btoa(bin).replaceAll('+', "-").replaceAll('/', "_");
  let i = encoded.length;
  while (i > 0 && encoded[i - 1] === "=") i--;
  return encoded.slice(0, i);
}

function b64decode(input: string): Uint8Array {
  const pad = input.length % 4 ? 4 - (input.length % 4) : 0;
  const bin = atob(input.replaceAll('-', "+").replaceAll('_', "/") + "====".slice(0, pad));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return b64encode(sig);
}

export async function createSession(
  data: Omit<SessionPayload, "exp">
): Promise<string> {
  const payload: SessionPayload = { ...data, exp: Date.now() + MAX_AGE * 1000 };
  const raw = b64encode(JSON.stringify(payload));
  const sig = await hmac(raw);
  return `${raw}.${sig}`;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function verifySession(
  token?: string | null
): Promise<SessionPayload | null> {
  if (!token?.includes(".")) return null;
  const [raw, sig] = token.split(".");
  if (!raw || !sig) return null;
  const expected = await hmac(raw);
  if (!timingSafeEqual(expected, sig)) return null;
  try {
    const payload = JSON.parse(
      new TextDecoder().decode(b64decode(raw))
    ) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE;
export const SESSION_MAX_AGE = MAX_AGE;