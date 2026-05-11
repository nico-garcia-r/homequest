import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { IPasswordHasher } from '../../domain/ports/IPasswordHasher.js';
import { UserAlreadyExistsError } from '../../domain/errors/AuthErrors.js';
import { ok, err, type Result } from '../../../../shared/domain/Result.js';
import type { DomainError } from '../../../../shared/domain/DomainError.js';

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface RegisterOutput {
  id: string;
  email: string;
  displayName: string;
}

export class RegisterUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hasher: IPasswordHasher,
  ) {}

  async execute(input: RegisterInput): Promise<Result<RegisterOutput, DomainError>> {
    const existing = await this.userRepo.findByEmail(input.email.toLowerCase());
    if (existing) return err(new UserAlreadyExistsError(input.email));

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.userRepo.create({
      email: input.email.toLowerCase(),
      passwordHash,
      displayName: input.displayName,
    });

    return ok({ id: user.id, email: user.email, displayName: user.displayName });
  }
}
