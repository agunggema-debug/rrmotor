/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { ISparepartRepository } from "./interfaces";

export class SparepartRepository implements ISparepartRepository {
  async findMany(where?: any, orderBy?: any): Promise<any[]> {
    return prisma.sparepart.findMany({ where, orderBy });
  }

  async findUnique(id: number): Promise<any | null> {
    return prisma.sparepart.findUnique({ where: { id } });
  }

  async create(data: any): Promise<any> {
    return prisma.sparepart.create({ data });
  }

  async update(id: number, data: any): Promise<any> {
    return prisma.sparepart.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prisma.sparepart.delete({ where: { id } });
  }

  async count(where?: any): Promise<number> {
    return prisma.sparepart.count({ where });
  }
}
