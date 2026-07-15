import { NextResponse } from "next/server";
import { requireRole, isUnauthorized } from "@/lib/auth";
import { BookingService } from "@/lib/services/booking.service";
import { HttpError, serverError } from "@/lib/http";

const bookingService = new BookingService();

export const dynamic = "force-dynamic";

// POST /api/bookings/[id]/findings — tambah temuan kerusakan (MECHANIC/ADMIN).
// Foto bukti diunggah lewat /api/upload, lalu URL-nya dikirim ke sini.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["MECHANIC", "ADMIN"]);
  if (isUnauthorized(auth)) return auth.response;

  const { id } = await params;
  try {
    const body = (await req.json()) as Record<string, unknown>;

    const finding = await bookingService.createFinding(Number(id), {
      name: body.name as string,
      note: body.note as string,
      price: body.price as number,
      photoUrl: body.photoUrl as string | null | undefined,
    });

    return NextResponse.json(finding, { status: 201 });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return serverError(e);
  }
}
