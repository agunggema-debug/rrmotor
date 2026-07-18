import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ITransactionItemRepository } from "./interfaces";

export class TransactionItemRepository implements ITransactionItemRepository {
  async updateMany(where: Prisma.TransactionItemWhereInput, data: Prisma.TransactionItemUpdateManyMutationInput): Promise<Prisma.BatchPayload> {
    return prisma.transactionItem.updateMany({ where, data });
  }
}
