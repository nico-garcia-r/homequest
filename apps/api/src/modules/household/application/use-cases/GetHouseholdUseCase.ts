import type { IHouseholdRepository } from '../../domain/ports/IHouseholdRepository.js';
import { HouseholdNotFoundError, NotMemberError } from '../../domain/errors/HouseholdErrors.js';
import { ok, err, type Result } from '../../../../shared/domain/Result.js';
import type { DomainError } from '../../../../shared/domain/DomainError.js';

export interface GetHouseholdOutput {
  id: string;
  name: string;
  members: Array<{ userId: string; displayName: string; email: string; role: string }>;
}

export class GetHouseholdUseCase {
  constructor(private readonly householdRepo: IHouseholdRepository) {}

  async execute(
    householdId: string,
    requestingUserId: string,
  ): Promise<Result<GetHouseholdOutput, DomainError>> {
    const data = await this.householdRepo.getWithMembers(householdId);
    if (!data) return err(new HouseholdNotFoundError(householdId));

    const isMember = data.members.some((m) => m.userId === requestingUserId);
    if (!isMember) return err(new NotMemberError());

    return ok({
      id: data.household.id,
      name: data.household.name,
      members: data.members.map((m) => ({
        userId: m.userId,
        displayName: m.displayName,
        email: m.email,
        role: m.role,
      })),
    });
  }
}
