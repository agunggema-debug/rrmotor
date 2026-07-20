import { getSupabase } from "@/lib/supabase";
import type { Transaction } from "@/lib/db-types";
import { ITransactionRepository, TransactionWithItems } from "./interfaces";

export class TransactionRepository implements ITransactionRepository {
  async findMany(where?: Partial<Transaction>, orderBy?: { created_at?: "asc" | "desc" }, take?: number): Promise<TransactionWithItems[]> {
    const supabase = getSupabase();
    let query = supabase.from("Transaction").select("*, items:TransactionItem(*, sparepart:Sparepart(id, name))");

    if (where?.payment_method) {
      query = query.eq("payment_method", where.payment_method);
    }

    if (orderBy?.created_at) {
      query = query.order("created_at", { ascending: orderBy.created_at === "asc" });
    }

    if (take) {
      query = query.limit(take);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((item) => this.transformTransaction(item));
  }

  async findUnique(id: number): Promise<TransactionWithItems | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("Transaction")
      .select("*, items:TransactionItem(*, sparepart:Sparepart(id, name))")
      .eq("id", id)
      .single();

    if (error) return null;
    return this.transformTransaction(data);
  }

  async create(data: Omit<Transaction, "id" | "created_at"> & { items: { sparepart_id: number; quantity: number; price_at_sale: number }[] }): Promise<Transaction> {
    const supabase = getSupabase();
    const { items, ...transactionData } = data;
    const transformedTransaction = this.transformToDb(transactionData);

    // Create transaction with items
    const { data: created, error } = await supabase
      .from("Transaction")
      .insert(transformedTransaction)
      .select("*")
      .single();

    if (error) throw error;

    // Create transaction items
    if (items && items.length > 0) {
      const itemsData = items.map((item) => ({
        transaction_id: (created as Record<string, unknown>).id as number,
        sparepart_id: item.sparepart_id,
        quantity: item.quantity,
        price_at_sale: item.price_at_sale,
      }));

      const { error: itemsError } = await supabase
        .from("TransactionItem")
        .insert(itemsData);

      if (itemsError) throw itemsError;
    }

    return this.transformTransactionSimple(created);
  }

  async updateMany(where: Partial<{ transaction_id: number; sparepart_id: number }>, updateData: Partial<{ price_at_sale: number }>): Promise<{ count: number }> {
    const supabase = getSupabase();
    
    if (updateData.price_at_sale === undefined) {
      return { count: 0 };
    }

    const updatePayload = { price_at_sale: updateData.price_at_sale };

    let query = supabase
      .from("TransactionItem")
      .update(updatePayload);

    if (where.transaction_id !== undefined) {
      query = query.eq("transaction_id", where.transaction_id);
    }
    if (where.sparepart_id !== undefined) {
      query = query.eq("sparepart_id", where.sparepart_id);
    }

    const { data, error } = await query.select();

    if (error) throw error;
    return { count: data?.length ?? 0 };
  }

  private transformTransaction(item: Record<string, unknown>): TransactionWithItems {
    const items = (item.items as unknown[] | undefined)?.map((it) => {
      const rawItem = it as Record<string, unknown>;
      const sparepart = rawItem.sparepart as { id: number; name: string } | undefined;
      return {
        sparepart_id: rawItem.sparepart_id as number,
        quantity: rawItem.quantity as number,
        price_at_sale: rawItem.price_at_sale as number,
        sparepart,
      };
    });

    return {
      id: item.id as number,
      invoice_number: item.invoice_number as string,
      customer_name: item.customer_name as string,
      customer_phone: item.customer_phone as string,
      total: item.total as number,
      cash: item.cash as number,
      change: item.change as number,
      payment_method: item.payment_method as "cash" | "qris" | "transfer",
      note: item.note as string,
      created_at: item.created_at as string,
      items,
    };
  }

  private transformTransactionSimple(data: Record<string, unknown>): Transaction {
    return {
      id: data.id as number,
      invoice_number: data.invoice_number as string,
      customer_name: data.customer_name as string,
      customer_phone: data.customer_phone as string,
      total: data.total as number,
      cash: data.cash as number,
      change: data.change as number,
      payment_method: data.payment_method as "cash" | "qris" | "transfer",
      note: data.note as string,
      created_at: data.created_at as string,
    };
  }

  private transformToDb(data: Partial<Transaction>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (data.invoice_number !== undefined) result.invoice_number = data.invoice_number;
    if (data.customer_name !== undefined) result.customer_name = data.customer_name;
    if (data.customer_phone !== undefined) result.customer_phone = data.customer_phone;
    if (data.total !== undefined) result.total = data.total;
    if (data.cash !== undefined) result.cash = data.cash;
    if (data.change !== undefined) result.change = data.change;
    if (data.payment_method !== undefined) result.payment_method = data.payment_method;
    if (data.note !== undefined) result.note = data.note;
    return result;
  }
}