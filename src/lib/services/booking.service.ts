import { BookingRepository } from "@/lib/repositories/booking";
import { FindingRepository } from "@/lib/repositories/finding";
import { HttpError } from "@/lib/http";
import { str, num, oneOf } from "@/lib/validate";
import type { Booking } from "@/lib/db-types";
import type { BookingWithRelations } from "@/lib/repositories/interfaces";

const bookingRepo = new BookingRepository();
const findingRepo = new FindingRepository();

const STATUSES = ["Menunggu", "Dikerjakan", "Test Drive", "Selesai"] as const;

// Transform snake_case to camelCase for frontend compatibility
function toCamelCaseBooking(b: BookingWithRelations) {
  return {
    id: b.id,
    queueNumber: b.queue_number,
    ownerName: b.owner_name,
    motor: b.motor,
    plate: b.plate,
    serviceType: b.service_type,
    appointmentDate: b.appointment_date,
    appointmentTime: b.appointment_time,
    status: b.status,
    basePrice: b.base_price,
    userId: b.user_id,
    mechanicId: b.mechanic_id,
    findings: b.findings?.map((f) => ({
      id: f.id,
      bookingId: f.booking_id,
      name: f.name,
      note: f.note,
      price: f.price,
      photoUrl: f.photo_url,
      status: f.status,
    })) ?? [],
    mechanic: b.mechanic
      ? {
          id: b.mechanic.id,
          name: b.mechanic.name,
          shift: b.mechanic.shift,
        }
      : null,
  };
}

export class BookingService {
  async createBooking(data: {
    ownerName: string;
    motor: string;
    plate: string;
    serviceType: string;
    appointmentDate: string;
    appointmentTime: string;
    basePrice: number;
    userId?: number | null;
  }) {
    const ownerName = str(data.ownerName, { required: true, max: 100, field: "ownerName" });
    const motor = str(data.motor, { required: true, max: 50, field: "motor" });
    const plate = str(data.plate, { required: true, max: 20, field: "plate" });
    const serviceType = str(data.serviceType, { required: true, max: 50, field: "serviceType" });
    const appointmentDate = str(data.appointmentDate, { required: true, max: 30, field: "appointmentDate" });
    const appointmentTime = str(data.appointmentTime, { required: true, max: 10, field: "appointmentTime" });
    const basePrice = num(data.basePrice, { required: true, min: 0, field: "basePrice" });

    let booking: BookingWithRelations | undefined;
    for (let attempt = 0; attempt < 5; attempt++) {
      const queueNumber = "A-" + Math.floor(10 + Math.random() * 89);
      try {
        booking = await bookingRepo.create({
          queue_number: queueNumber,
          owner_name: ownerName,
          motor,
          plate,
          service_type: serviceType,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          base_price: basePrice,
          ...(data.userId ? { user_id: data.userId } : {}),
        });
        break;
      } catch (e: unknown) {
        const code = (e as { code?: string })?.code;
        if (code === "23505" && attempt < 4) continue; // Supabase unique constraint violation code
        throw e;
      }
    }
    return toCamelCaseBooking(booking!);
  }

  async getBookings() {
    const bookings = await bookingRepo.findMany();
    return bookings.map(toCamelCaseBooking);
  }

  async getBooking(id: number) {
    const booking = await bookingRepo.findUnique(id);
    if (!booking) throw new HttpError(404, "Booking tidak ditemukan");
    return toCamelCaseBooking(booking);
  }

  async updateStatus(id: number, status: string, mechanicId?: number) {
    const validatedStatus = oneOf(status, STATUSES, "status");
    const data: Partial<Booking> = { status: validatedStatus };
    if (mechanicId != null) {
      data.mechanic_id = mechanicId;
    }
    return bookingRepo.update(id, data);
  }

  async createFinding(bookingId: number, data: {
    name: string;
    note: string;
    price: number;
    photoUrl?: string | null;
  }) {
    // Just check if booking exists - we don't need the relations for finding creation
    const { getSupabase } = await import("@/lib/supabase");
    const supabase = getSupabase();
    const { data: bookingCheck } = await supabase.from("Booking").select("id").eq("id", bookingId).single();
    if (!bookingCheck) throw new HttpError(404, "Booking tidak ditemukan");

    const name = str(data.name, { required: true, max: 100, field: "name" });
    const note = str(data.note, { max: 500, field: "note" });
    const price = num(data.price, { required: true, min: 0, field: "price" });
    const photoUrl = data.photoUrl == null ? null : str(data.photoUrl, { max: 300, field: "photoUrl" });

    return findingRepo.create({
      booking_id: bookingId,
      name,
      note,
      price,
      photo_url: photoUrl,
      status: "pending",
    });
  }

  async updateFindingStatus(findingId: number, status: string, customerUserId?: number) {
    const ALLOWED = ["pending", "approved", "rejected"] as const;
    const validatedStatus = oneOf(status, ALLOWED, "status");

    const finding = await findingRepo.findUniqueWithBooking(findingId);
    if (!finding) throw new HttpError(404, "Finding tidak ditemukan");

    if (customerUserId != null) {
      if (finding.booking?.user_id !== customerUserId) {
        throw new HttpError(403, "Akses ditolak");
      }
    }

    return findingRepo.update(findingId, { status: validatedStatus });
  }
}