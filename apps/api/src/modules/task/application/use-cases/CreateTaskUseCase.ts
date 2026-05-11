import type { ITaskRepository } from '../../domain/ports/ITaskRepository.js';
import type { IHouseholdRepository } from '../../../household/domain/ports/IHouseholdRepository.js';
import {
  HouseholdNotFoundError,
  NotMemberError,
  OnlyAdminError,
} from '../../../household/domain/errors/HouseholdErrors.js';
import { DIFFICULTY_POINTS } from '../../domain/entities/Task.js';
import type { Difficulty, RecurrenceType, TaskScope } from '../../domain/entities/Task.js';
import { ok, err, type Result } from '../../../../shared/domain/Result.js';
import type { DomainError } from '../../../../shared/domain/DomainError.js';

export interface CreateTaskInput {
  title: string;
  description?: string;
  difficulty: Difficulty;
  category?: string;
  scope?: TaskScope;
  recurrenceType: RecurrenceType;
  recurrenceDays?: string;
  householdId?: string;
  createdById: string;
}

export interface CreateTaskOutput {
  id: string;
  title: string;
  points: number;
  difficulty: Difficulty;
  category: string | null;
  scope: TaskScope;
  recurrenceType: RecurrenceType;
  recurrenceDays: string | null;
}

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepo: ITaskRepository,
    private readonly householdRepo: IHouseholdRepository,
  ) {}

  async execute(input: CreateTaskInput): Promise<Result<CreateTaskOutput, DomainError>> {
    const points = DIFFICULTY_POINTS[input.difficulty];

    // If a household is provided, validate membership and admin role
    if (input.householdId) {
      const household = await this.householdRepo.findById(input.householdId);
      if (!household) return err(new HouseholdNotFoundError(input.householdId));

      const member = await this.householdRepo.findMember(input.createdById, input.householdId);
      if (!member) return err(new NotMemberError());
      if (!member.isAdmin) return err(new OnlyAdminError());
    }

    const scope: TaskScope = input.householdId ? (input.scope ?? 'SHARED') : 'PERSONAL';

    const task = await this.taskRepo.create({
      title: input.title,
      description: input.description,
      points,
      householdId: input.householdId,
      createdById: input.createdById,
      scope,
      category: input.category,
      difficulty: input.difficulty,
      recurrenceType: input.recurrenceType,
      recurrenceDays: input.recurrenceDays,
    });

    return ok({
      id: task.id,
      title: task.title,
      points: task.points,
      difficulty: task.difficulty,
      category: task.category,
      scope: task.scope,
      recurrenceType: task.recurrenceType,
      recurrenceDays: task.recurrenceDays,
    });
  }
}
