import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE, type SessionPayload } from "@/lib/session";
import type { Role } from "@/lib/types";

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

export type Authorized = { session: SessionPayload };
export type Unauthorized = { response: NextResponse };
export type AuthResult = Authorized | Unauthorized;

// Guard: wajib login DAN memiliki salah satu role yang diizinkan.
// Mengembalikan { session } bila lolos, atau { response } (401/403) untuk di-return langsung.
export async function requireRole(roles: Role[]): Promise<AuthResult> {
  const session = await getCurrentSession();
  if (!session) {
    return {
      response: NextResponse.json({ error: "Tidak login" }, { status: 401 }),
    };
  }
  if (!roles.includes(session.role as Role)) {
    return {
      response: NextResponse.json({ error: "Akses ditolak" }, { status: 403 }),
    };
  }
  return { session };
}

export function isUnauthorized(result: AuthResult): result is Unauthorized {
  return "response" in result;
}
