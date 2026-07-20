import { getSupabase } from "@/lib/supabase";
import type { Portfolio } from "@/lib/db-types";
import { IPortfolioRepository } from "./interfaces";

export class PortfolioRepository implements IPortfolioRepository {
  async findMany(orderBy?: { id?: "asc" | "desc" }): Promise<Portfolio[]> {
    const supabase = getSupabase();
    let query = supabase.from("Portfolio").select("*");

    if (orderBy?.id) {
      query = query.order("id", { ascending: orderBy.id === "asc" });
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((item) => this.transformPortfolio(item));
  }

  async create(data: Omit<Portfolio, "id">): Promise<Portfolio> {
    const supabase = getSupabase();
    const transformedData = this.transformToDb(data);

    const { data: created, error } = await supabase
      .from("Portfolio")
      .insert(transformedData)
      .select("*")
      .single();

    if (error) throw error;
    return this.transformPortfolio(created);
  }

  private transformPortfolio(data: Record<string, unknown>): Portfolio {
    return {
      id: data.id as number,
      title: data.title as string,
      tag: data.tag as string,
      grad: data.grad as string,
    };
  }

  private transformToDb(data: Partial<Portfolio>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (data.title !== undefined) result.title = data.title;
    if (data.tag !== undefined) result.tag = data.tag;
    if (data.grad !== undefined) result.grad = data.grad;
    return result;
  }
}