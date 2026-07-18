import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Sparepart } from "@prisma/client";
import { ISparepartRepository } from "./interfaces";

export class SparepartRepository implements ISparepartRepository {
  async findMany(where?: Prisma.SparepartWhereInput, orderBy?: Prisma.SparepartOrderByWithRelationInput): Promise<Sparepart[]> {
    return prisma.sparepart.findMany({ where, orderBy });
  }

  async findUnique(id: number): Promise<Sparepart | null> {
    return prisma.sparepart.findUnique({ where: { id } });
  }

  async create(data: Prisma.SparepartCreateInput): Promise<Sparepart> {
    return prisma.sparepart.create({ data });
  }

  async update(id: number, data: Prisma.SparepartUpdateInput): Promise<Sparepart> {
    return prisma.sparepart.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prisma.sparepart.delete({ where: { id } });
  }

  async count(where?: Prisma.SparepartWhereInput): Promise<number> {
    return prisma.sparepart.count({ where });
  }
}
