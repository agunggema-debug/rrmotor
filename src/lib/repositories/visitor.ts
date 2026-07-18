import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { VisitorSession } from "@prisma/client";
import { IVisitorRepository } from "./interfaces";

export class VisitorRepository implements IVisitorRepository {
  async count(where?: Prisma.VisitorSessionWhereInput): Promise<number> {
    return prisma.visitorSession.count({ where });
  }

  async upsert(where: Prisma.VisitorSessionWhereUniqueInput, data: Prisma.VisitorSessionCreateInput): Promise<VisitorSession> {
    return prisma.visitorSession.upsert({ where, create: data, update: data });
  }

  async deleteMany(where: Prisma.VisitorSessionWhereInput): Promise<Prisma.BatchPayload> {
    return prisma.visitorSession.deleteMany({ where });
  }
}
