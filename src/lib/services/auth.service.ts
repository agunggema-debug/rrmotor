import { NextResponse } from "next/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import {
  createSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/password";
import { AccountRepository } from "@/lib/repositories/account";
import { UserRepository } from "@/lib/repositories/user";
import { HttpError } from "@/lib/http";
import { auditLog } from "@/lib/audit";

// Google accounts get a strong random hash since they don't use password login
// Generate a strong random hash at startup to prevent token reuse attacks
function getGooglePasswordHash(): string {
  const envHash = process.env.GOOGLE_ACCOUNT_PASSWORD_HASH;
  if (envHash?.startsWith("$argon2")) return envHash;
  // If not configured, return a placeholder that cannot be used for login
  // (Google users never authenticate via password)
  return "GOOGLE_OAUTH_ONLY_NO_PASSWORD_LOGIN";
}
const GOOGLE_ACCOUNT_PASSWORD_HASH = getGooglePasswordHash();
const accountRepo = new AccountRepository();
const userRepo = new UserRepository();

export class AuthService {
  async login(username: string, password: string, req?: Request) {
    // Validate input lengths to prevent abuse
    if (typeof username !== "string" || username.length > 100) {
      throw new HttpError(400, "Username tidak valid");
    }
    if (typeof password !== "string" || password.length > 128) {
      throw new HttpError(400, "Password tidak valid");
    }

    const ip = req ? getClientIP(req) : "unknown";
    const rateResult = await rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
    if (!rateResult.success) {
      const waitTime = Math.max(1, Math.ceil((rateResult.resetTime - Date.now()) / 60000));
      throw new HttpError(429, `Terlalu banyak percobaan login. Coba lagi dalam ${waitTime} menit.`);
    }

    const account = await accountRepo.findUnique({ username }, { user: true });
    if (!account || !(await verifyPassword(password, account.password_hash))) {
      auditLog("LOGIN_FAILED", { username }, account?.user_id ?? null);
      throw new HttpError(401, "Username atau password salah");
    }

    const token = await createSession({
      id: account.id,
      username: account.username,
      role: account.role as "ADMIN" | "MECHANIC" | "KASIR" | "CUSTOMER",
      userId: account.user_id ?? undefined,
    });

    auditLog("LOGIN_SUCCESS", { username, role: account.role }, account.user_id);

    const res = NextResponse.json({
      id: account.id,
      username: account.username,
      role: account.role,
      userId: account.user_id,
    });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    // Add rate-limit headers
    res.headers.set("X-RateLimit-Limit", String(5));
    res.headers.set("X-RateLimit-Remaining", String(rateResult.remaining));
    res.headers.set("X-RateLimit-Reset", String(Math.ceil(rateResult.resetTime / 1000)));

    return res;
  }

  async googleLogin(email: string, name: string, req?: Request) {
    const ip = req ? getClientIP(req) : "unknown";
    const rateResult = await rateLimit(`google_auth:${ip}`, 10, 15 * 60 * 1000);
    if (!rateResult.success) {
      const waitTime = Math.max(1, Math.ceil((rateResult.resetTime - Date.now()) / 60000));
      throw new HttpError(429, `Terlalu banyak percobaan. Coba lagi dalam ${waitTime} menit.`);
    }

    const username = email.toLowerCase();

    let account = await accountRepo.findUnique({ username }, { user: true });

    if (!account) {
      const user = await userRepo.create({
        name: name || username,
        phone: "",
        points: 0,
      });
      account = await accountRepo.create({
        username,
        password_hash: GOOGLE_ACCOUNT_PASSWORD_HASH,
        role: "CUSTOMER",
        user_id: user.id,
      });
    }

    const token = await createSession({
      id: account.id,
      username: account.username,
      role: account.role as "ADMIN" | "MECHANIC" | "KASIR" | "CUSTOMER",
      userId: account.user_id ?? undefined,
    });

    auditLog("GOOGLE_LOGIN", { email, role: account.role }, account.user_id);

    const res = NextResponse.json({
      id: account.id,
      username: account.username,
      role: account.role,
      userId: account.user_id,
    });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    // Add rate-limit headers
    res.headers.set("X-RateLimit-Limit", String(10));
    res.headers.set("X-RateLimit-Remaining", String(rateResult.remaining));
    res.headers.set("X-RateLimit-Reset", String(Math.ceil(rateResult.resetTime / 1000)));

    return res;
  }

  async logout() {
    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return res;
  }

  async hash(password: string): Promise<string> {
    return hashPassword(password);
  }
}
