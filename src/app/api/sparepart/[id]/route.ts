import { NextRequest, NextResponse } from "next/server";
import { SparepartService } from "@/lib/services/sparepart.service";
import { serverError } from "@/lib/http";

const sparepartService = new SparepartService();

export const dynamic = "force-dynamic";

// GET /api/sparepart/:id — detail sparepart (publik)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await sparepartService.getSparepart(Number(id));
    if (!item) {
      return NextResponse.json({ error: "Sparepart tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (e) {
    return serverError(e);
  }
}

// PUT /api/sparepart/:id — update sparepart (ADMIN)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { requireRole, isUnauthorized } = await import("@/lib/auth");
  const auth = await requireRole(["ADMIN"]);
  if (isUnauthorized(auth)) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const item = await sparepartService.updateSparepart(Number(id), body);
    return NextResponse.json(item);
  } catch (e) {
    if (e instanceof Error && e.message.includes("tidak ditemukan")) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    return serverError(e);
  }
}

// DELETE /api/sparepart/:id — hapus sparepart (ADMIN)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { requireRole, isUnauthorized } = await import("@/lib/auth");
  const auth = await requireRole(["ADMIN"]);
  if (isUnauthorized(auth)) return auth.response;

  try {
    const { id } = await params;
    await sparepartService.deleteSparepart(Number(id));
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message.includes("tidak ditemukan")) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    return serverError(e);
  }
}