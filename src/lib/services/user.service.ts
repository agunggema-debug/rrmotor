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
    const user = await userRepo.findUnique(id, { redemptions: { include: { reward: true } } });
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

    const [updated] = await userRepo.$transaction([
      userRepo.update(user.id, { points: { decrement: reward.cost } }),
      redemptionRepo.create({ userId: user.id, rewardId: reward.id }),
    ]);

    return updated;
  }
}
