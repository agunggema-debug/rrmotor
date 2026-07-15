/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { IRewardRepository } from "./interfaces";

export class RewardRepository implements IRewardRepository {
  async findMany(orderBy?: any): Promise<any[]> {
    return prisma.reward.findMany({ orderBy });
  }

  async findUnique(id: number): Promise<any | null> {
    return prisma.reward.findUnique({ where: { id } });
  }
}
