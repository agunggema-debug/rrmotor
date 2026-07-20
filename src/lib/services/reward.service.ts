import { RewardRepository } from "@/lib/repositories/reward";

const rewardRepo = new RewardRepository();

export class RewardService {
  async getRewards() {
    // Note: Supabase doesn't support ordering by 'cost' directly in type-safe way here
    // We'll order by id instead since our interface supports it
    return rewardRepo.findMany({ id: "asc" });
  }
}