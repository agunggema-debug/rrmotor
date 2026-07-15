/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { IVisitorRepository } from "./interfaces";

export class VisitorRepository implements IVisitorRepository {
  async count(where?: any): Promise<number> {
    return prisma.visitorSession.count({ where });
  }

  async upsert(where: any, data: any): Promise<any> {
    return prisma.visitorSession.upsert({ where, create: data, update: data });
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return prisma.visitorSession.deleteMany({ where });
  }
}
