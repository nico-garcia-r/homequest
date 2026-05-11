import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { IPasswordHasher } from '../../domain/ports/IPasswordHasher.js';
import { InvalidCredentialsError } from '../../domain/errors/AuthErrors.js';
import { ok, err, type Result } from '../../../../shared/domain/Result.js';
import type { DomainError } from '../../../../shared/domain/DomainError.js';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  id: string;
  email: string;
  displayName: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hasher: IPasswordHasher,
  ) {}

  async execute(input: LoginInput): Promise<Result<LoginOutput, DomainError>> {
    const user = await this.userRepo.findByEmail(input.email.toLowerCase());
    if (!user) return err(new InvalidCredentialsError());

    const valid = await this.hasher.verify(input.password, user.passwordHash);
    if (!valid) return err(new InvalidCredentialsError());

    return ok({ id: user.id, email: user.email, displayName: user.displayName });
  }
}
