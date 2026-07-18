import { NextResponse } from "next/server";
import { PortfolioService } from "@/lib/services/portfolio.service";
import { serverError } from "@/lib/http";

const portfolioService = new PortfolioService();

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const portfolio = await portfolioService.getPortfolios();
    return NextResponse.json(portfolio);
  } catch (e) {
    return serverError(e);
  }
}
