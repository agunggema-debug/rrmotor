import { NextRequest, NextResponse } from "next/server";
import { requireRole, isUnauthorized } from "@/lib/auth";
import { SparepartService } from "@/lib/services/sparepart.service";
import { HttpError, serverError } from "@/lib/http";

const sparepartService = new SparepartService();

export const dynamic = "force-dynamic";

// GET /api/sparepart — list sparepart (publik)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("category");

    const items = await sparepartService.getSpareparts(categoryParam || undefined);
    return NextResponse.json(items);
  } catch (e) {
    return serverError(e);
  }
}

// POST /api/sparepart — tambah sparepart (ADMIN)
export async function POST(req: NextRequest) {
  const auth = await requireRole(["ADMIN"]);
  if (isUnauthorized(auth)) return auth.response;

  try {
    const body = await req.json();
    const item = await sparepartService.createSparepart({
      name: body.name as string,
      category: body.category as string,
      price: body.price as number,
      stock: body.stock as number | undefined,
      description: body.description as string | undefined,
      imageUrl: body.imageUrl as string | undefined,
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return serverError(e);
  }
}