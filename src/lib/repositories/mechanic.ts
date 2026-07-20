import { getSupabase } from "@/lib/supabase";
import type { Mechanic } from "@/lib/db-types";
import { IMechanicRepository } from "./interfaces";

export class MechanicRepository implements IMechanicRepository {
  async findMany(): Promise<Mechanic[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("Mechanic")
      .select("*");

    if (error) throw error;
    return (data || []).map((item) => this.transformMechanic(item));
  }

  async findFirst(orderBy?: { id?: "asc" | "desc" }): Promise<Mechanic | null> {
    const supabase = getSupabase();
    let query = supabase.from("Mechanic").select("*");

    if (orderBy?.id) {
      query = query.order("id", { ascending: orderBy.id === "asc" });
    }

    const { data, error } = await query.single();

    if (error) return null;
    return this.transformMechanic(data);
  }

  async create(data: Omit<Mechanic, "id">): Promise<Mechanic> {
    const supabase = getSupabase();
    const transformedData = this.transformToDb(data);

    const { data: created, error } = await supabase
      .from("Mechanic")
      .insert(transformedData)
      .select("*")
      .single();

    if (error) throw error;
    return this.transformMechanic(created);
  }

  private transformMechanic(data: Record<string, unknown>): Mechanic {
    return {
      id: data.id as number,
      name: data.name as string,
      shift: data.shift as string,
    };
  }

  private transformToDb(data: Partial<Mechanic>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (data.name !== undefined) result.name = data.name;
    if (data.shift !== undefined) result.shift = data.shift;
    return result;
  }
}