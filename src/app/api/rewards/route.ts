import { NextResponse } from "next/server";
import { RewardService } from "@/lib/services/reward.service";
import { serverError } from "@/lib/http";

const rewardService = new RewardService();

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rewards = await rewardService.getRewards();
    return NextResponse.json(rewards);
  } catch (e) {
    return serverError(e);
  }
}
