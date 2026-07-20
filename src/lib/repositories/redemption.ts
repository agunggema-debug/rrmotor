import { getSupabase } from "@/lib/supabase";
import type { Redemption } from "@/lib/db-types";
import { IRedemptionRepository } from "./interfaces";

export class RedemptionRepository implements IRedemptionRepository {
  async create(data: Omit<Redemption, "id" | "created_at">): Promise<Redemption> {
    const supabase = getSupabase();
    const transformedData = this.transformToDb(data);

    const { data: created, error } = await supabase
      .from("Redemption")
      .insert(transformedData)
      .select("*")
      .single();

    if (error) throw error;
    return this.transformRedemption(created);
  }

  private transformRedemption(data: Record<string, unknown>): Redemption {
    return {
      id: data.id as number,
      user_id: data.user_id as number,
      reward_id: data.reward_id as number,
      created_at: data.created_at as string,
    };
  }

  private transformToDb(data: Partial<Redemption>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (data.user_id !== undefined) result.user_id = data.user_id;
    if (data.reward_id !== undefined) result.reward_id = data.reward_id;
    return result;
  }
}