import { NextResponse } from "next/server";
import { PortfolioService } from "@/lib/services/portfolio.service";

const portfolioService = new PortfolioService();

export const dynamic = "force-dynamic";

export async function GET() {
  const portfolio = await portfolioService.getPortfolios();
  return NextResponse.json(portfolio);
}
