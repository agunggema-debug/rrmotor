import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Redemption } from "@prisma/client";
import { IRedemptionRepository } from "./interfaces";

export class RedemptionRepository implements IRedemptionRepository {
  async create(data: Prisma.RedemptionCreateInput): Promise<Redemption> {
    return prisma.redemption.create({ data });
  }
}
