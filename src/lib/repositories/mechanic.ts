import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Mechanic } from "@prisma/client";
import { IMechanicRepository } from "./interfaces";

export class MechanicRepository implements IMechanicRepository {
  async findMany(): Promise<Mechanic[]> {
    return prisma.mechanic.findMany();
  }

  async findFirst(orderBy?: Prisma.MechanicOrderByWithRelationInput): Promise<Mechanic | null> {
    return prisma.mechanic.findFirst({ orderBy });
  }

  async create(data: Prisma.MechanicCreateInput): Promise<Mechanic> {
    return prisma.mechanic.create({ data });
  }
}
