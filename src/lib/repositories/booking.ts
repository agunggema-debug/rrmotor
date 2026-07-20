import { getSupabase } from "@/lib/supabase";
import type { Booking, Finding, Mechanic } from "@/lib/db-types";
import { IBookingRepository, BookingWithRelations } from "./interfaces";

export class BookingRepository implements IBookingRepository {
  async findMany(): Promise<BookingWithRelations[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("Booking")
      .select("*, findings:Finding(*), mechanic:Mechanic(*)");

    if (error) throw error;
    return (data || []).map((item) => this.transformBooking(item));
  }

  async findUnique(id: number): Promise<BookingWithRelations | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("Booking")
      .select("*, findings:Finding(*), mechanic:Mechanic(*)")
      .eq("id", id)
      .single();

    if (error) return null;
    return this.transformBooking(data);
  }

  async create(data: {
    queue_number: string;
    owner_name: string;
    motor: string;
    plate: string;
    service_type: string;
    appointment_date: string;
    appointment_time: string;
    base_price: number;
    user_id?: number | null;
  }): Promise<BookingWithRelations> {
    const supabase = getSupabase();
    const transformedData = this.transformToDb(data);

    const { data: created, error } = await supabase
      .from("Booking")
      .insert(transformedData)
      .select("*, findings:Finding(*), mechanic:Mechanic(*)")
      .single();

    if (error) throw error;
    return this.transformBooking(created);
  }

  async update(id: number, data: Partial<Booking>): Promise<Booking> {
    const supabase = getSupabase();
    const transformedData = this.transformToDb(data);

    const { data: updated, error } = await supabase
      .from("Booking")
      .update(transformedData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return this.transformBookingSimple(updated);
  }

  async delete(id: number): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("Booking")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async findFirst(where?: Partial<Booking>, orderBy?: { created_at?: "asc" | "desc" }): Promise<Booking | null> {
    const supabase = getSupabase();
    let query = supabase.from("Booking").select("*");

    if (where?.queue_number) {
      query = query.eq("queue_number", where.queue_number);
    }
    if (where?.status) {
      query = query.eq("status", where.status);
    }

    if (orderBy?.created_at) {
      query = query.order("created_at", { ascending: orderBy.created_at === "asc" });
    }

    const { data, error } = await query.single();

    if (error) return null;
    return this.transformBookingSimple(data);
  }

  private transformBooking(item: Record<string, unknown>): BookingWithRelations {
    const findings = (item.findings as unknown as Finding[] | undefined)?.map((f) => this.transformFinding(f as unknown as Record<string, unknown>));
    const mechanic = (item.mechanic as unknown as Mechanic | undefined) ? this.transformMechanic(item.mechanic as unknown as Record<string, unknown>) : undefined;

    return {
      id: item.id as number,
      queue_number: item.queue_number as string,
      owner_name: item.owner_name as string,
      motor: item.motor as string,
      plate: item.plate as string,
      service_type: item.service_type as string,
      appointment_date: item.appointment_date as string,
      appointment_time: item.appointment_time as string,
      status: item.status as "Menunggu" | "Dikerjakan" | "Test Drive" | "Selesai",
      base_price: item.base_price as number,
      created_at: item.created_at as string,
      user_id: item.user_id as number | null,
      mechanic_id: item.mechanic_id as number | null,
      findings,
      mechanic,
    };
  }

  private transformBookingSimple(data: Record<string, unknown>): Booking {
    return {
      id: data.id as number,
      queue_number: data.queue_number as string,
      owner_name: data.owner_name as string,
      motor: data.motor as string,
      plate: data.plate as string,
      service_type: data.service_type as string,
      appointment_date: data.appointment_date as string,
      appointment_time: data.appointment_time as string,
      status: data.status as "Menunggu" | "Dikerjakan" | "Test Drive" | "Selesai",
      base_price: data.base_price as number,
      created_at: data.created_at as string,
      user_id: data.user_id as number | null,
      mechanic_id: data.mechanic_id as number | null,
    };
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

  private transformMechanic(data: Record<string, unknown>): Mechanic {
    return {
      id: data.id as number,
      name: data.name as string,
      shift: data.shift as string,
    };
  }

  private transformToDb(data: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (data.queue_number !== undefined) result.queue_number = data.queue_number;
    if (data.owner_name !== undefined) result.owner_name = data.owner_name;
    if (data.motor !== undefined) result.motor = data.motor;
    if (data.plate !== undefined) result.plate = data.plate;
    if (data.service_type !== undefined) result.service_type = data.service_type;
    if (data.appointment_date !== undefined) result.appointment_date = data.appointment_date;
    if (data.appointment_time !== undefined) result.appointment_time = data.appointment_time;
    if (data.status !== undefined) result.status = data.status;
    if (data.base_price !== undefined) result.base_price = data.base_price;
    if (data.user_id !== undefined) result.user_id = data.user_id;
    if (data.mechanic_id !== undefined) result.mechanic_id = data.mechanic_id;
    return result;
  }
}