import { UserRepository } from "@/lib/repositories/user";
import { RewardRepository } from "@/lib/repositories/reward";
import { RedemptionRepository } from "@/lib/repositories/redemption";
import { HttpError } from "@/lib/http";
import { num } from "@/lib/validate";

const userRepo = new UserRepository();
const rewardRepo = new RewardRepository();
const redemptionRepo = new RedemptionRepository();

export class UserService {
  async getUser(id: number) {
    const user = await userRepo.findUnique(id);
    if (!user) throw new HttpError(404, "User tidak ditemukan");
    return user;
  }

  async redeemPoints(userId: number, rewardId: number) {
    const rewardIdNum = num(rewardId, { required: true, integer: true, min: 1, field: "rewardId" });

    const user = await userRepo.findUnique(userId);
    const reward = await rewardRepo.findUnique(rewardIdNum);

    if (!user || !reward) {
      throw new HttpError(404, "Data tidak ditemukan");
    }
    if (user.points < reward.cost) {
      throw new HttpError(400, "Poin tidak cukup");
    }

    // Update user points and create redemption (Supabase style)
    const updatedUser = await userRepo.update(user.id, { points: user.points - reward.cost });
    
    await redemptionRepo.create({
      user_id: user.id,
      reward_id: reward.id,
    });

    return updatedUser;
  }
}