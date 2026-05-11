import type { ITaskRepository } from '../../domain/ports/ITaskRepository.js';
import type { IHouseholdRepository } from '../../../household/domain/ports/IHouseholdRepository.js';
import {
  HouseholdNotFoundError,
  NotMemberError,
} from '../../../household/domain/errors/HouseholdErrors.js';
import { ok, err, type Result } from '../../../../shared/domain/Result.js';
import type { DomainError } from '../../../../shared/domain/DomainError.js';
import type { Difficulty, RecurrenceType, TaskScope } from '../../domain/entities/Task.js';

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  points: number;
  difficulty: Difficulty;
  category: string | null;
  scope: TaskScope;
  recurrenceType: RecurrenceType;
  recurrenceDays: string | null;
  createdById: string;
}

export class ListTasksUseCase {
  constructor(
    private readonly taskRepo: ITaskRepository,
    private readonly householdRepo: IHouseholdRepository,
  ) {}

  /** List tasks for a household (shared quests) */
  async execute(householdId: string, userId: string): Promise<Result<TaskItem[], DomainError>> {
    const household = await this.householdRepo.findById(householdId);
    if (!household) return err(new HouseholdNotFoundError(householdId));

    const member = await this.householdRepo.findMember(userId, householdId);
    if (!member) return err(new NotMemberError());

    const tasks = await this.taskRepo.findByHousehold(householdId);
    return ok(tasks.map(this.toItem));
  }

  /** List personal tasks for the authenticated user */
  async executePersonal(userId: string): Promise<Result<TaskItem[], DomainError>> {
    const tasks = await this.taskRepo.findByUser(userId);
    return ok(tasks.map(this.toItem));
  }

  private toItem(t: {
    id: string;
    title: string;
    description: string | null;
    points: number;
    difficulty: Difficulty;
    category: string | null;
    scope: TaskScope;
    recurrenceType: RecurrenceType;
    recurrenceDays: string | null;
    createdById: string;
  }): TaskItem {
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      points: t.points,
      difficulty: t.difficulty,
      category: t.category,
      scope: t.scope,
      recurrenceType: t.recurrenceType,
      recurrenceDays: t.recurrenceDays,
      createdById: t.createdById,
    };
  }
}
