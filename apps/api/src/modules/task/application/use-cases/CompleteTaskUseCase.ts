import type { ITaskRepository } from '../../domain/ports/ITaskRepository.js';
import type { IPointRepository } from '../../../points/domain/ports/IPointRepository.js';
import type { IHouseholdRepository } from '../../../household/domain/ports/IHouseholdRepository.js';
import { TaskNotFoundError, AlreadyCompletedTodayError } from '../../domain/errors/TaskErrors.js';
import { NotMemberError } from '../../../household/domain/errors/HouseholdErrors.js';
import { ok, err, type Result } from '../../../../shared/domain/Result.js';
import type { DomainError } from '../../../../shared/domain/DomainError.js';

export interface CompleteTaskOutput {
  completionId: string;
  pointsEarned: number;
  streak: { current: number; best: number } | null;
}

export class CompleteTaskUseCase {
  constructor(
    private readonly taskRepo: ITaskRepository,
    private readonly pointRepo: IPointRepository,
    private readonly householdRepo: IHouseholdRepository,
  ) {}

  async execute(taskId: string, userId: string): Promise<Result<CompleteTaskOutput, DomainError>> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) return err(new TaskNotFoundError(taskId));

    // Shared tasks require group membership
    if (task.householdId) {
      const member = await this.householdRepo.findMember(userId, task.householdId);
      if (!member) return err(new NotMemberError());
    }

    // One-time tasks can only be completed once ever
    if (task.recurrenceType === 'NONE') {
      const existing = await this.taskRepo.findCompletionEver(taskId, userId);
      if (existing) return err(new AlreadyCompletedTodayError());
    } else {
      // Recurring tasks: once per day
      const existing = await this.taskRepo.findCompletionToday(taskId, userId);
      if (existing) return err(new AlreadyCompletedTodayError());
    }

    const completion = await this.taskRepo.complete(taskId, userId);

    await this.pointRepo.grant({
      userId,
      amount: task.points,
      reason: `Completed: ${task.title}`,
      refId: completion.id,
    });

    // Update streak only for recurring tasks
    let streak: { current: number; best: number } | null = null;
    if (task.isRecurring) {
      const updated = await this.taskRepo.upsertStreak(taskId, userId);
      streak = { current: updated.current, best: updated.best };
    }

    return ok({ completionId: completion.id, pointsEarned: task.points, streak });
  }
}
