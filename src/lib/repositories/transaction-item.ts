/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { ITransactionItemRepository } from "./interfaces";

export class TransactionItemRepository implements ITransactionItemRepository {
  async updateMany(where: any, data: any): Promise<{ count: number }> {
    return prisma.transactionItem.updateMany({ where, data });
  }
}
