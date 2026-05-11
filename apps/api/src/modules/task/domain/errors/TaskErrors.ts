import { DomainError } from '../../../../shared/domain/DomainError.js';

export class TaskNotFoundError extends DomainError {
  readonly code = 'TASK_NOT_FOUND';
  constructor(id: string) {
    super(`Task ${id} not found`);
  }
}

export class AlreadyCompletedTodayError extends DomainError {
  readonly code = 'ALREADY_COMPLETED_TODAY';
  constructor() {
    super('This task has already been completed today');
  }
}
