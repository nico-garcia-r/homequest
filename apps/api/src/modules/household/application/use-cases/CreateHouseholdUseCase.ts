import type { IHouseholdRepository } from '../../domain/ports/IHouseholdRepository.js';
import { ok, type Result } from '../../../../shared/domain/Result.js';
import type { DomainError } from '../../../../shared/domain/DomainError.js';

export interface CreateHouseholdInput {
  name: string;
  creatorId: string;
}

export interface CreateHouseholdOutput {
  id: string;
  name: string;
}

export class CreateHouseholdUseCase {
  constructor(private readonly householdRepo: IHouseholdRepository) {}

  async execute(input: CreateHouseholdInput): Promise<Result<CreateHouseholdOutput, DomainError>> {
    const household = await this.householdRepo.create({
      name: input.name,
      creatorId: input.creatorId,
    });
    return ok({ id: household.id, name: household.name });
  }
}
