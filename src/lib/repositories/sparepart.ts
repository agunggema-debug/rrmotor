import { getSupabase } from "@/lib/supabase";
import type { Sparepart } from "@/lib/db-types";
import { ISparepartRepository } from "./interfaces";

export class SparepartRepository implements ISparepartRepository {
  async findMany(where?: Partial<Sparepart>, orderBy?: { name?: string; price?: "asc" | "desc" }): Promise<Sparepart[]> {
    const supabase = getSupabase();
    let query = supabase.from("Sparepart").select("*");

    if (where?.category) {
      query = query.eq("category", where.category);
    }
    if (where?.stock !== undefined) {
      query = query.eq("stock", where.stock);
    }

    if (orderBy?.name) {
      query = query.order("name", { ascending: orderBy.name === "asc" });
    }
    if (orderBy?.price) {
      query = query.order("price", { ascending: orderBy.price === "asc" });
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((item) => this.transformSparepart(item));
  }

  async findUnique(id: number): Promise<Sparepart | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("Sparepart")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return this.transformSparepart(data);
  }

  async create(data: Omit<Sparepart, "id" | "created_at" | "updated_at">): Promise<Sparepart> {
    const supabase = getSupabase();
    const transformedData = this.transformToDb(data);

    const { data: created, error } = await supabase
      .from("Sparepart")
      .insert(transformedData)
      .select("*")
      .single();

    if (error) throw error;
    return this.transformSparepart(created);
  }

  async update(id: number, data: Partial<Sparepart>): Promise<Sparepart> {
    const supabase = getSupabase();
    const transformedData = this.transformToDb(data);

    const { data: updated, error } = await supabase
      .from("Sparepart")
      .update(transformedData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return this.transformSparepart(updated);
  }

  async delete(id: number): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("Sparepart")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async count(where?: Partial<Sparepart>): Promise<number> {
    const supabase = getSupabase();
    let query = supabase.from("Sparepart").select("*", { count: "exact", head: true });

    if (where?.category) {
      query = query.eq("category", where.category);
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  }

  private transformSparepart(data: Record<string, unknown>): Sparepart {
    return {
      id: data.id as number,
      name: data.name as string,
      category: data.category as string,
      price: data.price as number,
      stock: data.stock as number,
      description: data.description as string,
      image_url: data.image_url as string,
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
    };
  }

  private transformToDb(data: Partial<Sparepart>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (data.name !== undefined) result.name = data.name;
    if (data.category !== undefined) result.category = data.category;
    if (data.price !== undefined) result.price = data.price;
    if (data.stock !== undefined) result.stock = data.stock;
    if (data.description !== undefined) result.description = data.description;
    if (data.image_url !== undefined) result.image_url = data.image_url;
    return result;
  }
}