import { getSupabase } from "@/lib/supabase";
import type { User } from "@/lib/db-types";
import { IUserRepository } from "./interfaces";

export class UserRepository implements IUserRepository {
  async findMany(): Promise<User[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("User")
      .select("*");

    if (error) throw error;
    return (data || []).map((item) => this.transformUser(item));
  }

  async findUnique(id: number): Promise<User | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return this.transformUser(data);
  }

  async findFirst(where?: Partial<User>): Promise<User | null> {
    const supabase = getSupabase();
    let query = supabase.from("User").select("*");

    if (where?.phone) {
      query = query.eq("phone", where.phone);
    }
    if (where?.name) {
      query = query.eq("name", where.name);
    }

    const { data, error } = await query.single();

    if (error) return null;
    return this.transformUser(data);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const supabase = getSupabase();
    const transformedData = this.transformToDb(data);

    const { data: updated, error } = await supabase
      .from("User")
      .update(transformedData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return this.transformUser(updated);
  }

  async create(data: Omit<User, "id" | "created_at">): Promise<User> {
    const supabase = getSupabase();
    const transformedData = this.transformToDb(data);

    const { data: created, error } = await supabase
      .from("User")
      .insert(transformedData)
      .select("*")
      .single();

    if (error) throw error;
    return this.transformUser(created);
  }

  async $transaction(arg: unknown[]): Promise<unknown[]> {
    // Supabase doesn't have built-in transaction support like Prisma
    // We handle this in the service layer with manual rollback logic
    const results = [];
    try {
      for (const queryFn of arg) {
        const result = await queryFn;
        results.push(result);
      }
    } catch (error) {
      throw error;
    }
    return results;
  }

  private transformUser(data: Record<string, unknown>): User {
    return {
      id: data.id as number,
      name: data.name as string,
      phone: data.phone as string,
      points: data.points as number,
      created_at: data.created_at as string,
    };
  }

  private transformToDb(data: Partial<User>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (data.name !== undefined) result.name = data.name;
    if (data.phone !== undefined) result.phone = data.phone;
    if (data.points !== undefined) result.points = data.points;
    return result;
  }
}