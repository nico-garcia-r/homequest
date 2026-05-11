import { DomainError } from '../../../../shared/domain/DomainError.js';

export class RewardNotFoundError extends DomainError {
  readonly code = 'REWARD_NOT_FOUND';
  constructor(id: string) {
    super(`Reward ${id} not found`);
  }
}

export class InsufficientPointsError extends DomainError {
  readonly code = 'INSUFFICIENT_POINTS';
  constructor(required: number, available: number) {
    super(`Insufficient points: need ${required}, have ${available}`);
  }
}
