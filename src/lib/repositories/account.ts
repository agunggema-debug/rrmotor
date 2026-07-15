/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { IAccountRepository } from "./interfaces";

export class AccountRepository implements IAccountRepository {
  async findUnique(where: any, include?: any): Promise<any | null> {
    return prisma.account.findUnique({ where, include });
  }

  async create(data: any): Promise<any> {
    return prisma.account.create({ data });
  }

  async upsert(where: any, data: any): Promise<any> {
    return prisma.account.upsert({ where, create: data, update: data });
  }

  async createMany(data: any[]): Promise<{ count: number }> {
    return prisma.account.createMany({ data });
  }
}
