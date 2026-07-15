import { NextResponse } from "next/server";
import { requireRole, isUnauthorized } from "@/lib/auth";
import { BookingService } from "@/lib/services/booking.service";
import { HttpError, serverError } from "@/lib/http";

const bookingService = new BookingService();

export const dynamic = "force-dynamic";

// PATCH /api/bookings/[id] — ubah status (MECHANIC/ADMIN)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["MECHANIC", "ADMIN"]);
  if (isUnauthorized(auth)) return auth.response;

  const { id } = await params;
  try {
    const body = (await req.json()) as { status?: unknown; mechanicId?: unknown };
    const status = body.status as string;
    const mechanicId = body.mechanicId as number | undefined;

    const booking = await bookingService.updateStatus(Number(id), status, mechanicId);
    return NextResponse.json(booking);
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if ((e as { code?: string })?.code === "P2025") {
      return NextResponse.json(
        { error: "Booking tidak ditemukan" },
        { status: 404 }
      );
    }
    return serverError(e);
  }
}
