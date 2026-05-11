import type { Reward, RewardRedemption } from '../entities/Reward.js';

export interface IRewardRepository {
  findById(id: string): Promise<Reward | null>;
  findByHousehold(householdId: string): Promise<Reward[]>;
  create(data: {
    title: string;
    description?: string;
    pointCost: number;
    householdId: string;
  }): Promise<Reward>;
  redeem(rewardId: string, userId: string): Promise<RewardRedemption>;
}
