import type { DomainError } from '../../domain/DomainError.js';

const STATUS_MAP: Record<string, number> = {
  USER_ALREADY_EXISTS: 409,
  INVALID_CREDENTIALS: 401,
  USER_NOT_FOUND: 404,
  HOUSEHOLD_NOT_FOUND: 404,
  ALREADY_MEMBER: 409,
  NOT_MEMBER: 403,
  TASK_NOT_FOUND: 404,
  ALREADY_COMPLETED_TODAY: 409,
  REWARD_NOT_FOUND: 404,
  INSUFFICIENT_POINTS: 402,
  ONLY_ADMIN: 403,
};

export function mapDomainError(error: DomainError): number {
  return STATUS_MAP[error.code] ?? 400;
}
