/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { IBookingRepository } from "./interfaces";

export class BookingRepository implements IBookingRepository {
  async findMany(include?: any): Promise<any[]> {
    return prisma.booking.findMany({ include });
  }

  async findUnique(id: number): Promise<any | null> {
    return prisma.booking.findUnique({ where: { id } });
  }

  async create(data: any): Promise<any> {
    return prisma.booking.create({ data, include: { findings: true } });
  }

  async update(id: number, data: any): Promise<any> {
    return prisma.booking.update({
      where: { id },
      data,
      include: { findings: true, mechanic: true },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.booking.delete({ where: { id } });
  }

  async findFirst(where?: any, orderBy?: any): Promise<any | null> {
    return prisma.booking.findFirst({ where, orderBy });
  }
}
