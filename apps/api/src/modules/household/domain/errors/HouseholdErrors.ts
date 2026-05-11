import { DomainError } from '../../../../shared/domain/DomainError.js';

export class HouseholdNotFoundError extends DomainError {
  readonly code = 'HOUSEHOLD_NOT_FOUND';
  constructor(id: string) {
    super(`Household ${id} not found`);
  }
}

export class AlreadyMemberError extends DomainError {
  readonly code = 'ALREADY_MEMBER';
  constructor() {
    super('User is already a member of this household');
  }
}

export class NotMemberError extends DomainError {
  readonly code = 'NOT_MEMBER';
  constructor() {
    super('User is not a member of this household');
  }
}

export class OnlyAdminError extends DomainError {
  readonly code = 'ONLY_ADMIN';
  constructor() {
    super('Only household admins can perform this action');
  }
}
