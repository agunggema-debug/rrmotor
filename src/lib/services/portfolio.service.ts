import { PortfolioRepository } from "@/lib/repositories/portfolio";

const portfolioRepo = new PortfolioRepository();

export class PortfolioService {
  async getPortfolios() {
    return portfolioRepo.findMany({ id: "asc" });
  }
}
