/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { IFindingRepository } from "./interfaces";

export class FindingRepository implements IFindingRepository {
  async findMany(where?: any): Promise<any[]> {
    return prisma.finding.findMany({ where });
  }

  async findUnique(id: number): Promise<any | null> {
    return prisma.finding.findUnique({
      where: { id },
      include: { booking: true },
    });
  }

  async create(data: any): Promise<any> {
    return prisma.finding.create({ data });
  }

  async update(id: number, data: any): Promise<any> {
    return prisma.finding.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prisma.finding.delete({ where: { id } });
  }
}
