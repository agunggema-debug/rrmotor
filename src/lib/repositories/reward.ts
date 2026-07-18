import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Reward } from "@prisma/client";
import { IRewardRepository } from "./interfaces";

export class RewardRepository implements IRewardRepository {
  async findMany(orderBy?: Prisma.RewardOrderByWithRelationInput): Promise<Reward[]> {
    return prisma.reward.findMany({ orderBy });
  }

  async findUnique(id: number): Promise<Reward | null> {
    return prisma.reward.findUnique({ where: { id } });
  }
}
