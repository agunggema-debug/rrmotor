import { NextResponse } from "next/server";
import { requireRole, isUnauthorized } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";
import { HttpError, serverError } from "@/lib/http";

const userService = new UserService();

export const dynamic = "force-dynamic";

// Pastikan user login & (admin ATAU pemilik data itu sendiri).
async function authorizeOwner(id: string) {
  const auth = await requireRole(["ADMIN", "CUSTOMER"]);
  if (isUnauthorized(auth)) return auth;
  if (auth.session.role === "CUSTOMER") {
    const ownerId = Number(id);
    if (auth.session.userId == null || auth.session.userId !== ownerId) {
      return {
        response: NextResponse.json({ error: "Akses ditolak" }, { status: 403 }),
      };
    }
  }
  return auth;
}

// GET /api/users/[id] — profil + riwayat redeem (pemilik/admin)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorizeOwner(id);
  if (isUnauthorized(auth)) return auth.response;

  try {
    const user = await userService.getUser(Number(id));
    return NextResponse.json(user);
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return serverError(e);
  }
}

// POST /api/users/[id] — tukar poin (pemilik/admin)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorizeOwner(id);
  if (isUnauthorized(auth)) return auth.response;

  try {
    const body = (await req.json()) as { rewardId?: unknown };
    const rewardId = body.rewardId as number;

    const updated = await userService.redeemPoints(Number(id), rewardId);
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return serverError(e);
  }
}
