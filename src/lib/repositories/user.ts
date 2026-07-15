/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { IUserRepository } from "./interfaces";

export class UserRepository implements IUserRepository {
  async findUnique(id: number, include?: any): Promise<any | null> {
    return prisma.user.findUnique({ where: { id }, include });
  }

  async findFirst(where?: any): Promise<any | null> {
    return prisma.user.findFirst({ where });
  }

  async update(id: number, data: any): Promise<any> {
    return prisma.user.update({ where: { id }, data });
  }

  async create(data: any): Promise<any> {
    return prisma.user.create({ data });
  }

  async $transaction(arg: any[]): Promise<any> {
    return prisma.$transaction(arg);
  }
}
