import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

const PROTECTED = ["/admin", "/mekanik", "/kasir"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  const allowed =
    session &&
    (session.role === "ADMIN" ||
      session.role === "MECHANIC" ||
      session.role === "KASIR");
  if (!allowed) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/mekanik/:path*", "/kasir/:path*"],
};
