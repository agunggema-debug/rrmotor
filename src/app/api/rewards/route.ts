import { NextResponse } from "next/server";
import { RewardService } from "@/lib/services/reward.service";

const rewardService = new RewardService();

export const dynamic = "force-dynamic";

export async function GET() {
  const rewards = await rewardService.getRewards();
  return NextResponse.json(rewards);
}
