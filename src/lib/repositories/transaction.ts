/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { ITransactionRepository } from "./interfaces";

export class TransactionRepository implements ITransactionRepository {
  async findMany(where?: any, orderBy?: any, take?: number, include?: any): Promise<any[]> {
    return prisma.transaction.findMany({ where, orderBy, take, include });
  }

  async findUnique(id: number, include?: any): Promise<any | null> {
    return prisma.transaction.findUnique({ where: { id }, include });
  }

  async create(data: any): Promise<any> {
    return prisma.transaction.create({ data });
  }

  async updateMany(where: any, data: any): Promise<{ count: number }> {
    return prisma.transactionItem.updateMany({ where, data });
  }
}
