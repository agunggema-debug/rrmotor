import { getSupabase } from "@/lib/supabase";
import type { Finding } from "@/lib/db-types";
import { IFindingRepository } from "./interfaces";

export class FindingRepository implements IFindingRepository {
  async findMany(where?: Partial<Finding>): Promise<Finding[]> {
    const supabase = getSupabase();
    let query = supabase.from("Finding").select("*");

    if (where?.booking_id !== undefined) {
      query = query.eq("booking_id", where.booking_id);
    }
    if (where?.status) {
      query = query.eq("status", where.status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((item) => this.transformFinding(item));
  }

  async findUnique(id: number): Promise<Finding | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("Finding")
      .select("*, booking:Booking(*)")
      .eq("id", id)
      .single();

    if (error) return null;
    return this.transformFinding(data);
  }

  async create(data: Omit<Finding, "id">): Promise<Finding> {
    const supabase = getSupabase();
    const transformedData = this.transformToDb(data);

    const { data: created, error } = await supabase
      .from("Finding")
      .insert(transformedData)
      .select("*")
      .single();

    if (error) throw error;
    return this.transformFinding(created);
  }

  async update(id: number, data: Partial<Finding>): Promise<Finding> {
    const supabase = getSupabase();
    const transformedData = this.transformToDb(data);

    const { data: updated, error } = await supabase
      .from("Finding")
      .update(transformedData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return this.transformFinding(updated);
  }

  async delete(id: number): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("Finding")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  private transformFinding(data: Record<string, unknown>): Finding {
    return {
      id: data.id as number,
      booking_id: data.booking_id as number,
      name: data.name as string,
      note: data.note as string,
      price: data.price as number,
      photo_url: data.photo_url as string | null,
      status: data.status as "pending" | "approved" | "rejected",
    };
  }

  // For updateFindingStatus, we need to return booking relation for auth check
  async findUniqueWithBooking(id: number): Promise<(Finding & { booking: { user_id: number | null } }) | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("Finding")
      .select("*, booking:Booking(user_id)")
      .eq("id", id)
      .single();

    if (error) return null;
    return {
      ...this.transformFinding(data),
      booking: (data.booking as { user_id: number | null }) ?? { user_id: null },
    };
  }

  private transformToDb(data: Partial<Finding>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (data.booking_id !== undefined) result.booking_id = data.booking_id;
    if (data.name !== undefined) result.name = data.name;
    if (data.note !== undefined) result.note = data.note;
    if (data.price !== undefined) result.price = data.price;
    if (data.photo_url !== undefined) result.photo_url = data.photo_url;
    if (data.status !== undefined) result.status = data.status;
    return result;
  }
}
