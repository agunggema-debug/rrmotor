import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Account } from "@prisma/client";
import { IAccountRepository } from "./interfaces";

export class AccountRepository implements IAccountRepository {
  async findUnique(where: Prisma.AccountWhereUniqueInput, include?: Prisma.AccountInclude): Promise<Account | null> {
    return prisma.account.findUnique({ where, include });
  }

  async create(data: Prisma.AccountCreateInput): Promise<Account> {
    return prisma.account.create({ data });
  }

  async upsert(where: Prisma.AccountWhereUniqueInput, data: Prisma.AccountCreateInput): Promise<Account> {
    return prisma.account.upsert({ where, create: data, update: data });
  }

  async createMany(data: Prisma.AccountCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return prisma.account.createMany({ data });
  }
}
