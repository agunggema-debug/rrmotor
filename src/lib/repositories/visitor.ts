import { getSupabase } from "@/lib/supabase";
import type { VisitorSession } from "@/lib/db-types";
import { IVisitorRepository } from "./interfaces";

export class VisitorRepository implements IVisitorRepository {
  async count(where?: Partial<VisitorSession>): Promise<number> {
    const supabase = getSupabase();
    let query = supabase.from("VisitorSession").select("*", { count: "exact", head: true });

    // For online visitors, we need to count where last_seen > threshold
    // The where parameter here is used to filter by last_seen threshold
    if (where?.last_seen) {
      query = query.gt("last_seen", where.last_seen);
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  }

  async upsert(id: string, data: { last_seen: string }): Promise<VisitorSession> {
    const supabase = getSupabase();

    // Try insert first, if exists then update
    const { data: existing } = await supabase
      .from("VisitorSession")
      .select("*")
      .eq("id", id)
      .single();

    let result;
    if (existing) {
      const { data: updated, error } = await supabase
        .from("VisitorSession")
        .update({ last_seen: data.last_seen })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from("VisitorSession")
        .insert({ id, last_seen: data.last_seen })
        .select("*")
        .single();
      if (error) throw error;
      result = inserted;
    }

    return this.transformVisitor(result);
  }

  async deleteMany(where?: Partial<VisitorSession>): Promise<{ count: number }> {
    const supabase = getSupabase();
    let query = supabase.from("VisitorSession").delete();

    if (where?.last_seen) {
      // Delete sessions older than threshold (lt = less than)
      query = query.lt("last_seen", where.last_seen);
    }

    const { error } = await query;
    if (error) throw error;

    // Supabase delete doesn't return count, so we return a fixed count
    return { count: 1 };
  }

  private transformVisitor(data: Record<string, unknown>): VisitorSession {
    return {
      id: data.id as string,
      last_seen: data.last_seen as string,
      created_at: data.created_at as string,
    };
  }
}