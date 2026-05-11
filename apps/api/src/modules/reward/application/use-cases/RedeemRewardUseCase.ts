import type { IRewardRepository } from '../../domain/ports/IRewardRepository.js';
import type { IPointRepository } from '../../../points/domain/ports/IPointRepository.js';
import type { IHouseholdRepository } from '../../../household/domain/ports/IHouseholdRepository.js';
import { RewardNotFoundError, InsufficientPointsError } from '../../domain/errors/RewardErrors.js';
import { NotMemberError } from '../../../household/domain/errors/HouseholdErrors.js';
import { ok, err, type Result } from '../../../../shared/domain/Result.js';
import type { DomainError } from '../../../../shared/domain/DomainError.js';

export interface RedeemRewardOutput {
  redemptionId: string;
  pointsSpent: number;
  newBalance: number;
}

export class RedeemRewardUseCase {
  constructor(
    private readonly rewardRepo: IRewardRepository,
    private readonly pointRepo: IPointRepository,
    private readonly householdRepo: IHouseholdRepository,
  ) {}

  async execute(
    rewardId: string,
    userId: string,
  ): Promise<Result<RedeemRewardOutput, DomainError>> {
    const reward = await this.rewardRepo.findById(rewardId);
    if (!reward) return err(new RewardNotFoundError(rewardId));

    const member = await this.householdRepo.findMember(userId, reward.householdId);
    if (!member) return err(new NotMemberError());

    const balance = await this.pointRepo.getBalance(userId);
    if (balance < reward.pointCost)
      return err(new InsufficientPointsError(reward.pointCost, balance));

    const redemption = await this.rewardRepo.redeem(rewardId, userId);

    await this.pointRepo.spend({
      userId,
      amount: reward.pointCost,
      reason: `Redeemed reward: ${reward.title}`,
      refId: redemption.id,
    });

    const newBalance = await this.pointRepo.getBalance(userId);
    return ok({ redemptionId: redemption.id, pointsSpent: reward.pointCost, newBalance });
  }
}
