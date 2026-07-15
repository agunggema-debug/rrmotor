import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { BookingService } from "@/lib/services/booking.service";
import { HttpError, serverError } from "@/lib/http";

const bookingService = new BookingService();

export const dynamic = "force-dynamic";

const STAFF_ROLES = ["MECHANIC", "ADMIN"] as const;

// PATCH /api/bookings/[id]/findings/[fid] — approve/reject.
// Diizinkan untuk: pemilik booking (CUSTOMER) atau staf (MECHANIC/ADMIN).
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak login" }, { status: 401 });
  }

  const isStaff = (STAFF_ROLES as readonly string[]).includes(session.role);
  const isOwnerCustomer =
    session.role === "CUSTOMER" && session.userId != null;

  if (!isStaff && !isOwnerCustomer) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { fid } = await params;
  try {
    const body = (await req.json()) as { status?: unknown };
    const status = body.status as string;

    const customerUserId = session.role === "CUSTOMER" ? session.userId! : undefined;
    const updated = await bookingService.updateFindingStatus(Number(fid), status, customerUserId);
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if ((e as { code?: string })?.code === "P2025") {
      return NextResponse.json(
        { error: "Finding tidak ditemukan" },
        { status: 404 }
      );
    }
    return serverError(e);
  }
}
