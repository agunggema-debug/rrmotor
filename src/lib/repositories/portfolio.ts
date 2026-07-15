/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { IPortfolioRepository } from "./interfaces";

export class PortfolioRepository implements IPortfolioRepository {
  async findMany(orderBy?: any): Promise<any[]> {
    return prisma.portfolio.findMany({ orderBy });
  }

  async create(data: any): Promise<any> {
    return prisma.portfolio.create({ data });
  }
}
