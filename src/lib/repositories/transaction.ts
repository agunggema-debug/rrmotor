import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Transaction as PrismaTransaction } from "@prisma/client";
import { ITransactionRepository } from "./interfaces";

export class TransactionRepository implements ITransactionRepository {
  async findMany(where?: Prisma.TransactionWhereInput, orderBy?: Prisma.TransactionOrderByWithRelationInput, take?: number, include?: Prisma.TransactionInclude): Promise<PrismaTransaction[]> {
    return prisma.transaction.findMany({ where, orderBy, take, include });
  }

  async findUnique(id: number, include?: Prisma.TransactionInclude): Promise<PrismaTransaction | null> {
    return prisma.transaction.findUnique({ where: { id }, include });
  }

  async create(data: Prisma.TransactionCreateInput): Promise<PrismaTransaction> {
    return prisma.transaction.create({ data });
  }

  async updateMany(where: Prisma.TransactionItemWhereInput, data: Prisma.TransactionItemUpdateManyMutationInput): Promise<Prisma.BatchPayload> {
    return prisma.transactionItem.updateMany({ where, data });
  }
}
