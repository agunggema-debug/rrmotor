import { RewardRepository } from "@/lib/repositories/reward";

const rewardRepo = new RewardRepository();

export class RewardService {
  async getRewards() {
    return rewardRepo.findMany({ orderBy: { cost: "asc" } });
  }
}
