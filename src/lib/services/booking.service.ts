import { BookingRepository } from "@/lib/repositories/booking";
import { FindingRepository } from "@/lib/repositories/finding";
import { HttpError } from "@/lib/http";
import { str, num, oneOf } from "@/lib/validate";
import type { Prisma } from "@prisma/client";

const bookingRepo = new BookingRepository();
const findingRepo = new FindingRepository();

const STATUSES = ["Menunggu", "Dikerjakan", "Test Drive", "Selesai"] as const;

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

    let booking;
    for (let attempt = 0; attempt < 5; attempt++) {
      const queueNumber = "A-" + Math.floor(10 + Math.random() * 89);
      try {
        booking = await bookingRepo.create({
          queueNumber,
          ownerName,
          motor,
          plate,
          serviceType,
          appointmentDate,
          appointmentTime,
          basePrice,
          ...(data.userId ? { user: { connect: { id: data.userId } } } : {}),
        });
        break;
      } catch (e: unknown) {
        const code = (e as { code?: string })?.code;
        if (code === "P2002" && attempt < 4) continue;
        throw e;
      }
    }
    return booking;
  }

  async getBookings() {
    return bookingRepo.findMany({
      findings: true,
      mechanic: true,
    } satisfies Prisma.BookingInclude);
  }

  async getBooking(id: number) {
    const booking = await bookingRepo.findUnique(id);
    if (!booking) throw new HttpError(404, "Booking tidak ditemukan");
    return booking;
  }

  async updateStatus(id: number, status: string, mechanicId?: number) {
    const validatedStatus = oneOf(status, STATUSES, "status");
    const data: Record<string, unknown> = { status: validatedStatus };
    if (mechanicId != null) {
      data.mechanic = { connect: { id: mechanicId } };
    }
    return bookingRepo.update(id, data as Prisma.BookingUpdateInput);
  }

  async createFinding(bookingId: number, data: {
    name: string;
    note: string;
    price: number;
    photoUrl?: string | null;
  }) {
    const booking = await bookingRepo.findUnique(bookingId);
    if (!booking) throw new HttpError(404, "Booking tidak ditemukan");

    const name = str(data.name, { required: true, max: 100, field: "name" });
    const note = str(data.note, { max: 500, field: "note" });
    const price = num(data.price, { required: true, min: 0, field: "price" });
    const photoUrl = data.photoUrl == null ? null : str(data.photoUrl, { max: 300, field: "photoUrl" });

    return findingRepo.create({
      booking: { connect: { id: bookingId } },
      name,
      note,
      price,
      photoUrl,
      status: "pending",
    });
  }

  async updateFindingStatus(findingId: number, status: string, customerUserId?: number) {
    const ALLOWED = ["pending", "approved", "rejected"] as const;
    const validatedStatus = oneOf(status, ALLOWED, "status");

    const finding = await findingRepo.findUnique(findingId);
    if (!finding) throw new HttpError(404, "Finding tidak ditemukan");

    // Cast to access included booking relation
    if (customerUserId != null) {
      const bookingWithRelation = finding as unknown as { booking: { userId: number | null } };
      if (bookingWithRelation.booking?.userId !== customerUserId) {
        throw new HttpError(403, "Akses ditolak");
      }
    }

    return findingRepo.update(findingId, { status: validatedStatus });
  }
}
