import { NextRequest, NextResponse } from "next/server";
import { requireRole, isUnauthorized } from "@/lib/auth";
import { SparepartService } from "@/lib/services/sparepart.service";
import { HttpError, serverError } from "@/lib/http";

const sparepartService = new SparepartService();

// GET /api/sparepart/[id] — detail (publik)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const item = await sparepartService.getSparepart(Number(id));
    return NextResponse.json(item);
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return serverError(e);
  }
}

// PUT /api/sparepart/[id] — update (ADMIN)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["ADMIN"]);
  if (isUnauthorized(auth)) return auth.response;

  const { id } = await params;
  try {
    const body = await req.json();
    const item = await sparepartService.updateSparepart(Number(id), body);
    return NextResponse.json(item);
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return serverError(e);
  }
}

// DELETE /api/sparepart/[id] — hapus (ADMIN)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["ADMIN"]);
  if (isUnauthorized(auth)) return auth.response;

  const { id } = await params;
  try {
    await sparepartService.deleteSparepart(Number(id));
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if ((e as { code?: string })?.code === "P2025") {
      return NextResponse.json(
        { error: "Sparepart tidak ditemukan" },
        { status: 404 }
      );
    }
    return serverError(e);
  }
}
