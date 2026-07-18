import { TransactionRepository } from "@/lib/repositories/transaction";
import { SparepartRepository } from "@/lib/repositories/sparepart";
import { TransactionItemRepository } from "@/lib/repositories/transaction-item";
import { HttpError } from "@/lib/http";
import { str, num, oneOf } from "@/lib/validate";

const transactionRepo = new TransactionRepository();
const sparepartRepo = new SparepartRepository();
const transactionItemRepo = new TransactionItemRepository();

const PAYMENTS = ["cash", "qris", "transfer"] as const;

function genInvoice(): string {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV/${dateStr}/${rand}`;
}

export class TransactionService {
  async getTransactions(limit = 50) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    return transactionRepo.findMany(
      {},
      { createdAt: "desc" },
      safeLimit,
      {
        items: { include: { sparepart: { select: { id: true, name: true } } } },
      }
    );
  }

  async createTransaction(data: {
    items: { sparepartId: number; quantity: number }[];
    customerName?: string;
    customerPhone?: string;
    cash: number;
    paymentMethod: string;
    note?: string;
  }) {
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new HttpError(400, "Minimal 1 item diperlukan");
    }

    const parsedItems = data.items.map((it) => ({
      sparepartId: num(it.sparepartId, { required: true, integer: true, min: 1, field: "sparepartId" }),
      quantity: num(it.quantity, { required: true, integer: true, min: 1, field: "quantity" }),
    }));

    const payment = oneOf(data.paymentMethod, PAYMENTS, "paymentMethod");
    const cashAmount = num(data.cash, { min: 0, field: "cash" });

    let total = 0;
    const itemsWithPrice = await Promise.all(
      parsedItems.map(async (item) => {
        const sparepart = await sparepartRepo.findUnique(item.sparepartId);
        if (!sparepart) throw new HttpError(404, `Sparepart id ${item.sparepartId} tidak ditemukan`);
        if (sparepart.stock < item.quantity) {
          throw new HttpError(400, `Stock ${sparepart.name} tidak mencukupi (tersedia: ${sparepart.stock})`);
        }
        const itemTotal = sparepart.price * item.quantity;
        total += itemTotal;
        return { ...item, price: sparepart.price };
      })
    );

    const change = cashAmount >= total ? cashAmount - total : 0;

    let transaction;
    for (let attempt = 0; attempt < 5; attempt++) {
      const invoiceNumber = genInvoice();
      try {
        transaction = await transactionRepo.create({
          invoiceNumber,
          customerName: str(data.customerName, { max: 100, field: "customerName" }),
          customerPhone: str(data.customerPhone, { max: 30, field: "customerPhone" }),
          total,
          cash: cashAmount,
          change,
          paymentMethod: payment,
          note: str(data.note, { max: 500, field: "note" }),
          items: {
            createMany: {
              data: itemsWithPrice.map((item) => ({
                sparepartId: item.sparepartId,
                quantity: item.quantity,
                priceAtSale: 0,
              })),
            },
          },
        });
        break;
      } catch (e: unknown) {
        const code = (e as { code?: string })?.code;
        if (code === "P2002" && attempt < 4) continue;
        throw e;
      }
    }

    for (const item of itemsWithPrice) {
      await transactionItemRepo.updateMany(
        { transactionId: transaction!.id, sparepartId: item.sparepartId },
        { priceAtSale: item.price }
      );
      await sparepartRepo.update(item.sparepartId, { stock: { decrement: item.quantity } });
    }

    const final = await transactionRepo.findUnique(transaction!.id, {
      items: { include: { sparepart: { select: { id: true, name: true } } } },
    });

    return final;
  }
}
