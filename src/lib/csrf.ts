/**
 * CSRF Protection utility.
 * 
 * This app uses SameSite=Lax cookies which provide built-in CSRF protection
 * for state-changing requests (POST, PUT, PATCH, DELETE) from external sites.
 * 
 * For additional protection on critical endpoints, we use a double-submit
 * cookie pattern: a CSRF token is set as a cookie and must be sent as a
 * header (X-CSRF-Token) on state-changing requests.
 */

import { NextResponse } from "next/server";

const CSRF_COOKIE = "rr_csrf";
const CSRF_HEADER = "x-csrf-token";

/**
 * Generate a cryptographically random CSRF token.
 */
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Set the CSRF cookie on a response.
 * Call this on GET requests that render forms or pages with state-changing actions.
 */
export function setCsrfCookie(res: NextResponse): void {
  const token = generateToken();
  res.cookies.set(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
}

/**
 * Validate CSRF token from request.
 * Checks that the X-CSRF-Token header matches the cookie value.
 * 
 * Note: SameSite=Lax already protects against most CSRF attacks.
 * This is an additional defense-in-depth measure.
 */
export async function validateCsrf(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return false;

  const csrfCookie = parseCookie(cookieHeader, CSRF_COOKIE);
  const csrfHeader = req.headers.get(CSRF_HEADER);

  if (!csrfCookie || !csrfHeader) return false;
  if (csrfCookie.length !== 64 || csrfHeader.length !== 64) return false;

  // Timing-safe comparison
  return timingSafeEqual(csrfCookie, csrfHeader);
}

function parseCookie(header: string, name: string): string | null {
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}