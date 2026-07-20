import { getSupabase } from "@/lib/supabase";
import type { Reward } from "@/lib/db-types";
import { IRewardRepository } from "./interfaces";

export class RewardRepository implements IRewardRepository {
  async findMany(orderBy?: { id?: "asc" | "desc"; cost?: "asc" | "desc" }): Promise<Reward[]> {
    const supabase = getSupabase();
    let query = supabase.from("Reward").select("*");

    // Apply ordering - prefer cost, then id
    if (orderBy?.cost) {
      query = query.order("cost", { ascending: orderBy.cost === "asc" });
    } else if (orderBy?.id) {
      query = query.order("id", { ascending: orderBy.id === "asc" });
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((item) => this.transformReward(item));
  }

  async findUnique(id: number): Promise<Reward | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("Reward")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return this.transformReward(data);
  }

  private transformReward(data: Record<string, unknown>): Reward {
    return {
      id: data.id as number,
      name: data.name as string,
      cost: data.cost as number,
      icon: data.icon as string,
      tag: data.tag as string,
    };
  }
}