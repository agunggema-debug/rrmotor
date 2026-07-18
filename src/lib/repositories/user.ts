import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { User } from "@prisma/client";
import { IUserRepository } from "./interfaces";

export class UserRepository implements IUserRepository {
  async findUnique(id: number, include?: Prisma.UserInclude): Promise<User | null> {
    return prisma.user.findUnique({ where: { id }, include });
  }

  async findFirst(where?: Prisma.UserWhereInput): Promise<User | null> {
    return prisma.user.findFirst({ where });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async $transaction(arg: Prisma.PrismaPromise<unknown>[]): Promise<unknown[]> {
    return prisma.$transaction(arg);
  }
}
