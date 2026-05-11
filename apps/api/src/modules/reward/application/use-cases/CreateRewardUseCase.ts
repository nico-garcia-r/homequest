import type { IRewardRepository } from '../../domain/ports/IRewardRepository.js';
import type { IHouseholdRepository } from '../../../household/domain/ports/IHouseholdRepository.js';
import {
  HouseholdNotFoundError,
  NotMemberError,
  OnlyAdminError,
} from '../../../household/domain/errors/HouseholdErrors.js';
import { ok, err, type Result } from '../../../../shared/domain/Result.js';
import type { DomainError } from '../../../../shared/domain/DomainError.js';

export interface CreateRewardInput {
  title: string;
  description?: string;
  pointCost: number;
  householdId: string;
  createdById: string;
}

export class CreateRewardUseCase {
  constructor(
    private readonly rewardRepo: IRewardRepository,
    private readonly householdRepo: IHouseholdRepository,
  ) {}

  async execute(
    input: CreateRewardInput,
  ): Promise<Result<{ id: string; title: string; pointCost: number }, DomainError>> {
    const household = await this.householdRepo.findById(input.householdId);
    if (!household) return err(new HouseholdNotFoundError(input.householdId));

    const member = await this.householdRepo.findMember(input.createdById, input.householdId);
    if (!member) return err(new NotMemberError());
    if (!member.isAdmin) return err(new OnlyAdminError());

    const reward = await this.rewardRepo.create({
      title: input.title,
      description: input.description,
      pointCost: input.pointCost,
      householdId: input.householdId,
    });

    return ok({ id: reward.id, title: reward.title, pointCost: reward.pointCost });
  }
}
