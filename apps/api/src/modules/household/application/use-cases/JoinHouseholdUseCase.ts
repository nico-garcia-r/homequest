import type { IHouseholdRepository } from '../../domain/ports/IHouseholdRepository.js';
import { HouseholdNotFoundError, AlreadyMemberError } from '../../domain/errors/HouseholdErrors.js';
import { ok, err, type Result } from '../../../../shared/domain/Result.js';
import type { DomainError } from '../../../../shared/domain/DomainError.js';

export interface JoinHouseholdInput {
  userId: string;
  householdId: string;
}

export interface JoinHouseholdOutput {
  householdId: string;
  role: string;
}

export class JoinHouseholdUseCase {
  constructor(private readonly householdRepo: IHouseholdRepository) {}

  async execute(input: JoinHouseholdInput): Promise<Result<JoinHouseholdOutput, DomainError>> {
    const household = await this.householdRepo.findById(input.householdId);
    if (!household) return err(new HouseholdNotFoundError(input.householdId));

    const existing = await this.householdRepo.findMember(input.userId, input.householdId);
    if (existing) return err(new AlreadyMemberError());

    const member = await this.householdRepo.addMember({
      userId: input.userId,
      householdId: input.householdId,
      role: 'MEMBER',
    });

    return ok({ householdId: input.householdId, role: member.role });
  }
}
