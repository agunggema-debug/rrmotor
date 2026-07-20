import { TransactionRepository } from "@/lib/repositories/transaction";
import { SparepartRepository } from "@/lib/repositories/sparepart";
import { TransactionItemRepository } from "@/lib/repositories/transaction-item";
import { HttpError } from "@/lib/http";
import { str, num, oneOf } from "@/lib/validate";
import type { Transaction } from "@/lib/db-types";

const transactionRepo = new TransactionRepository();
const sparepartRepo = new SparepartRepository();
const transactionItemRepo = new TransactionItemRepository();

const PAYMENTS = ["cash", "qris", "transfer"] as const;
type PaymentMethod = (typeof PAYMENTS)[number];

function genInvoice(): string {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV/${dateStr}/${rand}`;
}

async function validateItems(items: { sparepartId: number; quantity: number }[]): Promise<{ sparepartId: number; quantity: number; price: number }[]> {
  const parsedItems = items.map((it) => ({
    sparepartId: num(it.sparepartId, { required: true, integer: true, min: 1, field: "sparepartId" }),
    quantity: num(it.quantity, { required: true, integer: true, min: 1, field: "quantity" }),
  }));

  const itemsWithPrice: { sparepartId: number; quantity: number; price: number }[] = [];

  for (const item of parsedItems) {
    const sparepart = await sparepartRepo.findUnique(item.sparepartId);
    if (!sparepart) throw new HttpError(404, `Sparepart id ${item.sparepartId} tidak ditemukan`);
    if (sparepart.stock < item.quantity) {
      throw new HttpError(400, `Stock ${sparepart.name} tidak mencukupi (tersedia: ${sparepart.stock})`);
    }
    itemsWithPrice.push({ ...item, price: sparepart.price });
  }

  return itemsWithPrice;
}

type TransactionCreateData = {
  customerName?: string;
  customerPhone?: string;
  total: number;
  cash: number;
  change: number;
  paymentMethod: PaymentMethod;
  note?: string;
  items: { sparepartId: number; quantity: number }[];
};

async function createTransactionWithRetry(transactionData: TransactionCreateData): Promise<Transaction | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const invoiceNumber = genInvoice();
    try {
      const transaction = await transactionRepo.create({
        invoice_number: invoiceNumber,
        customer_name: str(transactionData.customerName, { max: 100, field: "customerName" }),
        customer_phone: str(transactionData.customerPhone, { max: 30, field: "customerPhone" }),
        total: transactionData.total,
        cash: transactionData.cash,
        change: transactionData.change,
        payment_method: transactionData.paymentMethod,
        note: str(transactionData.note, { max: 500, field: "note" }),
        items: transactionData.items.map((item) => ({
          sparepart_id: item.sparepartId,
          quantity: item.quantity,
          price_at_sale: 0,
        })),
      });
      return transaction;
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === "23505" && attempt < 4) continue; // Supabase unique constraint violation code
      throw e;
    }
  }
  return null;
}

async function updateStockAndItems(transactionId: number, items: { sparepartId: number; quantity: number; price: number }[]): Promise<void> {
  for (const item of items) {
    await transactionItemRepo.updateMany(
      { transaction_id: transactionId, sparepart_id: item.sparepartId },
      { price_at_sale: item.price }
    );
    const currentSparepart = await sparepartRepo.findUnique(item.sparepartId);
    if (currentSparepart) {
      await sparepartRepo.update(item.sparepartId, { stock: currentSparepart.stock - item.quantity });
    }
  }
}

export class TransactionService {
  async getTransactions(limit = 50) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    return transactionRepo.findMany(
      {},
      { created_at: "desc" },
      safeLimit,
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

    const itemsWithPrice = await validateItems(data.items);
    const total = itemsWithPrice.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const payment = oneOf(data.paymentMethod, PAYMENTS, "paymentMethod");
    const cashAmount = num(data.cash, { min: 0, field: "cash" });
    const change = cashAmount >= total ? cashAmount - total : 0;

    const transaction = await createTransactionWithRetry({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      total,
      cash: cashAmount,
      change,
      paymentMethod: payment,
      note: data.note,
      items: itemsWithPrice,
    });

    if (!transaction) {
      throw new HttpError(500, "Gagal membuat transaksi setelah beberapa percobaan");
    }

    await updateStockAndItems(transaction.id, itemsWithPrice);

    return transactionRepo.findUnique(transaction.id);
  }
}