import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Finding } from "@prisma/client";
import { IFindingRepository } from "./interfaces";

export class FindingRepository implements IFindingRepository {
  async findMany(where?: Prisma.FindingWhereInput): Promise<Finding[]> {
    return prisma.finding.findMany({ where });
  }

  async findUnique(id: number): Promise<Finding | null> {
    return prisma.finding.findUnique({
      where: { id },
      include: { booking: true },
    });
  }

  async create(data: Prisma.FindingCreateInput): Promise<Finding> {
    return prisma.finding.create({ data });
  }

  async update(id: number, data: Prisma.FindingUpdateInput): Promise<Finding> {
    return prisma.finding.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prisma.finding.delete({ where: { id } });
  }
}
