import { getSupabase } from "@/lib/supabase";
import type { Account, User } from "@/lib/db-types";
import { IAccountRepository, AccountWithUser } from "./interfaces";

export class AccountRepository implements IAccountRepository {
  async findUnique(where: { username?: string; id?: number }, include?: { user?: boolean }): Promise<AccountWithUser | null> {
    const supabase = getSupabase();
    let query = supabase.from("Account").select(include?.user ? "*, user:User(*)" : "*");

    if (where.username) {
      query = query.eq("username", where.username);
    }
    if (where.id !== undefined) {
      query = query.eq("id", where.id);
    }

    const { data, error } = await query.single();

    if (error) return null;
    if (!data) return null;
    return this.transformAccount(data as unknown as Record<string, unknown>, include?.user);
  }

  async create(data: Omit<Account, "id" | "created_at">): Promise<Account> {
    const supabase = getSupabase();
    const transformedData = this.transformToDb(data);

    const { data: created, error } = await supabase
      .from("Account")
      .insert(transformedData)
      .select("*")
      .single();

    if (error) throw error;
    return this.transformAccountSimple(created);
  }

  async upsert(where: { username?: string; id?: number }, data: Omit<Account, "id" | "created_at">): Promise<Account> {
    const supabase = getSupabase();
    const transformedData = this.transformToDb(data);

    if (where.username) {
      const { data: existing } = await supabase
        .from("Account")
        .select("*")
        .eq("username", where.username)
        .single();

      if (existing) {
        const { data: updated, error } = await supabase
          .from("Account")
          .update(transformedData)
          .eq("username", where.username)
          .select("*")
          .single();
        if (error) throw error;
        return this.transformAccountSimple(updated);
      }
    }

    const { data: created, error } = await supabase
      .from("Account")
      .insert(transformedData)
      .select("*")
      .single();

    if (error) throw error;
    return this.transformAccountSimple(created);
  }

  async createMany(data: Omit<Account, "id" | "created_at">[]): Promise<{ count: number }> {
    const supabase = getSupabase();
    const transformedData = data.map(this.transformToDb);

    const { data: created, error } = await supabase
      .from("Account")
      .insert(transformedData)
      .select();

    if (error) throw error;
    return { count: created?.length ?? 0 };
  }

  private transformAccount(data: Record<string, unknown>, includeUser?: boolean): AccountWithUser {
    const result: AccountWithUser = {
      id: data.id as number,
      username: data.username as string,
      password_hash: data.password_hash as string,
      role: data.role as "ADMIN" | "MECHANIC" | "KASIR" | "CUSTOMER",
      user_id: data.user_id as number | null,
      created_at: data.created_at as string,
    };

    if (includeUser && data.user) {
      result.user = data.user as User | null;
    }

    return result;
  }

  private transformAccountSimple(data: Record<string, unknown>): Account {
    return {
      id: data.id as number,
      username: data.username as string,
      password_hash: data.password_hash as string,
      role: data.role as "ADMIN" | "MECHANIC" | "KASIR" | "CUSTOMER",
      user_id: data.user_id as number | null,
      created_at: data.created_at as string,
    };
  }

  private transformToDb(data: Partial<Account>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (data.username !== undefined) result.username = data.username;
    if (data.password_hash !== undefined) result.password_hash = data.password_hash;
    if (data.role !== undefined) result.role = data.role;
    if (data.user_id !== undefined) result.user_id = data.user_id;
    return result;
  }
}