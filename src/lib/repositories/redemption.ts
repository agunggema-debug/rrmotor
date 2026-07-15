/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { IRedemptionRepository } from "./interfaces";

export class RedemptionRepository implements IRedemptionRepository {
  async create(data: any): Promise<any> {
    return prisma.redemption.create({ data });
  }
}
