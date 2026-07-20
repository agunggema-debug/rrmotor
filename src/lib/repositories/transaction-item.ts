import { getSupabase } from "@/lib/supabase";
import { ITransactionItemRepository } from "./interfaces";

export class TransactionItemRepository implements ITransactionItemRepository {
  async updateMany(where: Partial<{ transaction_id: number; sparepart_id: number }>, data: Partial<{ price_at_sale: number }>): Promise<{ count: number }> {
    const supabase = getSupabase();
    
    if (data.price_at_sale === undefined) {
      return { count: 0 };
    }

    const updatePayload = { price_at_sale: data.price_at_sale };

    let query = supabase
      .from("TransactionItem")
      .update(updatePayload);

    if (where.transaction_id !== undefined) {
      query = query.eq("transaction_id", where.transaction_id);
    }
    if (where.sparepart_id !== undefined) {
      query = query.eq("sparepart_id", where.sparepart_id);
    }

    const { data: result, error } = await query.select();

    if (error) throw error;
    return { count: result?.length ?? 0 };
  }
}