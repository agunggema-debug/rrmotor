import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Portfolio } from "@prisma/client";
import { IPortfolioRepository } from "./interfaces";

export class PortfolioRepository implements IPortfolioRepository {
  async findMany(orderBy?: Prisma.PortfolioOrderByWithRelationInput): Promise<Portfolio[]> {
    return prisma.portfolio.findMany({ orderBy });
  }

  async create(data: Prisma.PortfolioCreateInput): Promise<Portfolio> {
    return prisma.portfolio.create({ data });
  }
}
