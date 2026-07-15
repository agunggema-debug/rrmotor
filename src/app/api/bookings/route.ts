import { NextResponse } from "next/server";
import { requireRole, isUnauthorized } from "@/lib/auth";
import { BookingService } from "@/lib/services/booking.service";
import { HttpError, serverError } from "@/lib/http";

const bookingService = new BookingService();

export const dynamic = "force-dynamic";

// GET /api/bookings — list (publik, untuk live progress)
export async function GET() {
  try {
    const bookings = await bookingService.getBookings();
    return NextResponse.json(bookings);
  } catch (e) {
    return serverError(e);
  }
}

// POST /api/bookings — buat booking (hanya CUSTOMER yang login)
export async function POST(req: Request) {
  const auth = await requireRole(["CUSTOMER"]);
  if (isUnauthorized(auth)) return auth.response;

  try {
    const body = (await req.json()) as Record<string, unknown>;

    const booking = await bookingService.createBooking({
      ownerName: body.ownerName as string,
      motor: body.motor as string,
      plate: body.plate as string,
      serviceType: body.serviceType as string,
      appointmentDate: body.appointmentDate as string,
      appointmentTime: body.appointmentTime as string,
      basePrice: body.basePrice as number,
      userId: auth.session.userId ?? null,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return serverError(e);
  }
}
