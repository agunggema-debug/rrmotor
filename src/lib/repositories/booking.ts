import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Booking } from "@prisma/client";
import { IBookingRepository } from "./interfaces";

export class BookingRepository implements IBookingRepository {
  async findMany(include?: Prisma.BookingInclude): Promise<Booking[]> {
    return prisma.booking.findMany({ include });
  }

  async findUnique(id: number): Promise<Booking | null> {
    return prisma.booking.findUnique({ where: { id } });
  }

  async create(data: Prisma.BookingCreateInput): Promise<Booking> {
    return prisma.booking.create({ data, include: { findings: true } });
  }

  async update(id: number, data: Prisma.BookingUpdateInput): Promise<Booking> {
    return prisma.booking.update({
      where: { id },
      data,
      include: { findings: true, mechanic: true },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.booking.delete({ where: { id } });
  }

  async findFirst(where?: Prisma.BookingWhereInput, orderBy?: Prisma.BookingOrderByWithRelationInput): Promise<Booking | null> {
    return prisma.booking.findFirst({ where, orderBy });
  }
}
