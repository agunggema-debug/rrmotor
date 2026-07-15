import { NextRequest, NextResponse } from "next/server";
import { requireRole, isUnauthorized } from "@/lib/auth";
import { TransactionService } from "@/lib/services/transaction.service";
import { HttpError, serverError } from "@/lib/http";

const transactionService = new TransactionService();

export const dynamic = "force-dynamic";

// GET /api/transactions — list transaksi (kasir/admin)
export async function GET(req: NextRequest) {
  const auth = await requireRole(["KASIR", "ADMIN"]);
  if (isUnauthorized(auth)) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("limit");
    const limit = raw ? Math.min(Math.max(Number(raw) || 50, 1), 100) : 50;

    const transactions = await transactionService.getTransactions(limit);
    return NextResponse.json(transactions);
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return serverError(e);
  }
}

// POST /api/transactions — buat transaksi baru (kasir/admin)
export async function POST(req: NextRequest) {
  const auth = await requireRole(["KASIR", "ADMIN"]);
  if (isUnauthorized(auth)) return auth.response;

  try {
    const body = await req.json();
    const { items, customerName, customerPhone, cash, paymentMethod, note } = body as {
      items?: unknown;
      customerName?: unknown;
      customerPhone?: unknown;
      cash?: unknown;
      paymentMethod?: unknown;
      note?: unknown;
    };

    const transaction = await transactionService.createTransaction({
      items: items as { sparepartId: number; quantity: number }[],
      customerName: customerName as string | undefined,
      customerPhone: customerPhone as string | undefined,
      cash: cash as number,
      paymentMethod: paymentMethod as string,
      note: note as string | undefined,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return serverError(e);
  }
}
