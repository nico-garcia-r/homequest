import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import { UserNotFoundError } from '../../domain/errors/AuthErrors.js';
import { ok, err, type Result } from '../../../../shared/domain/Result.js';
import type { DomainError } from '../../../../shared/domain/DomainError.js';

export interface GetMeOutput {
  id: string;
  email: string;
  displayName: string;
}

export class GetMeUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(userId: string): Promise<Result<GetMeOutput, DomainError>> {
    const user = await this.userRepo.findById(userId);
    if (!user) return err(new UserNotFoundError(userId));
    return ok({ id: user.id, email: user.email, displayName: user.displayName });
  }
}
