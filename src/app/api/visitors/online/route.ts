// Presensi pengunjung (guest) yang sedang online.
// GET  -> mengembalikan jumlah pengunjung aktif (tanpa menulis).
// POST -> heartbeat: mendaftarkan/me-refresh sesi anonim lalu mengembalikan jumlah aktif.
// Mitigasi OWASP: rate-limit per IP, id anonim divalidasi, cookie HttpOnly/SameSite.

import { NextResponse } from "next/server";
import { VisitorRepository } from "@/lib/repositories/visitor";
import { serverError } from "@/lib/http";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const VISITOR_COOKIE = "rr_visitor";
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // dianggap online jika terlihat < 5 menit lalu
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 tahun
const STALE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // purge sesi yang tidak terlihat > 1 hari
const PURGE_INTERVAL_MS = 5 * 60 * 1000; // throttle pembersihan maksimal sekali per 5 menit
const ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

let lastPurge = 0;
const visitorRepo = new VisitorRepository();

async function purgeStale(): Promise<void> {
  const now = Date.now();
  if (now - lastPurge < PURGE_INTERVAL_MS) return;
  lastPurge = now;
  // Delete visitor sessions older than 1 day
  const staleThreshold = new Date(now - STALE_MAX_AGE_MS).toISOString();
  await visitorRepo.deleteMany({ last_seen: staleThreshold });
}

function isProd() {
  return process.env.NODE_ENV === "production";
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

async function countOnline(): Promise<number> {
  const since = new Date(Date.now() - ONLINE_THRESHOLD_MS).toISOString();
  return visitorRepo.count({ last_seen: since });
}

export async function GET() {
  try {
    const online = await countOnline();
    return NextResponse.json({ online });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  try {
    const rl = await rateLimit(`visitor:${getClientIP(req)}`, 20, 60_000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429 }
      );
    }

    let visitorId = parseCookie(req.headers.get("cookie"), VISITOR_COOKIE);
    let setCookie = false;

    if (!visitorId || !ID_PATTERN.test(visitorId)) {
      visitorId = crypto.randomUUID();
      setCookie = true;
    }

    // Upsert visitor session using Supabase
    await visitorRepo.upsert(visitorId, { last_seen: new Date().toISOString() });

    void purgeStale().catch(() => {});

    const online = await countOnline();

    const res = NextResponse.json({ online });
    if (setCookie) {
      res.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        secure: isProd(),
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    }
    return res;
  } catch (e) {
    return serverError(e);
  }
}