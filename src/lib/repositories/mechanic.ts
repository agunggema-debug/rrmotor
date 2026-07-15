/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { IMechanicRepository } from "./interfaces";

export class MechanicRepository implements IMechanicRepository {
  async findMany(): Promise<any[]> {
    return prisma.mechanic.findMany();
  }

  async findFirst(orderBy?: any): Promise<any | null> {
    return prisma.mechanic.findFirst({ orderBy });
  }

  async create(data: any): Promise<any> {
    return prisma.mechanic.create({ data });
  }
}
