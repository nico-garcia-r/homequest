import type { PrismaClient, Task as PrismaTask } from '@prisma/client';
import type {
  ITaskRepository,
  CompletionView,
  CreateTaskData,
} from '../../domain/ports/ITaskRepository.js';
import { Task, TaskCompletion, TaskStreak } from '../../domain/entities/Task.js';
import type { TaskScope, Difficulty, RecurrenceType } from '../../domain/entities/Task.js';

// Prisma stores these as plain strings; cast to domain types at the boundary.
function toTask(r: PrismaTask): Task {
  return new Task({
    ...r,
    scope: r.scope as TaskScope,
    difficulty: r.difficulty as Difficulty,
    recurrenceType: r.recurrenceType as RecurrenceType,
  });
}

export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ── Queries ──────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Task | null> {
    const row = await this.prisma.task.findUnique({ where: { id } });
    return row ? toTask(row) : null;
  }

  async findByHousehold(householdId: string): Promise<Task[]> {
    const rows = await this.prisma.task.findMany({
      where: { householdId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toTask);
  }

  async findByUser(userId: string): Promise<Task[]> {
    const rows = await this.prisma.task.findMany({
      where: { createdById: userId, scope: 'PERSONAL', householdId: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toTask);
  }

  // ── Mutations ─────────────────────────────────────────────────────────────────

  async create(data: CreateTaskData): Promise<Task> {
    const row = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        points: data.points,
        householdId: data.householdId ?? null,
        createdById: data.createdById,
        scope: data.scope,
        category: data.category ?? null,
        difficulty: data.difficulty,
        recurrenceType: data.recurrenceType,
        recurrenceDays: data.recurrenceDays ?? null,
      },
    });
    return toTask(row);
  }

  // ── Completions ───────────────────────────────────────────────────────────────

  async findCompletionToday(taskId: string, userId: string): Promise<TaskCompletion | null> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const row = await this.prisma.taskCompletion.findFirst({
      where: { taskId, userId, completedAt: { gte: start, lte: end } },
    });
    return row ? new TaskCompletion(row) : null;
  }

  async findCompletionEver(taskId: string, userId: string): Promise<TaskCompletion | null> {
    const row = await this.prisma.taskCompletion.findFirst({ where: { taskId, userId } });
    return row ? new TaskCompletion(row) : null;
  }

  async complete(taskId: string, userId: string): Promise<TaskCompletion> {
    const row = await this.prisma.taskCompletion.create({ data: { taskId, userId } });
    return new TaskCompletion(row);
  }

  async findCompletionsForHousehold(householdId: string): Promise<CompletionView[]> {
    const rows = await this.prisma.taskCompletion.findMany({
      where: { task: { householdId } },
      include: { task: { select: { title: true } }, user: { select: { displayName: true } } },
      orderBy: { completedAt: 'desc' },
      take: 50,
    });
    return rows.map((r) => ({
      id: r.id,
      taskId: r.taskId,
      userId: r.userId,
      completedAt: r.completedAt,
      taskTitle: r.task.title,
      userDisplayName: r.user.displayName,
    }));
  }

  async findCompletionsForUser(userId: string): Promise<CompletionView[]> {
    const rows = await this.prisma.taskCompletion.findMany({
      where: { userId, task: { householdId: null } },
      include: { task: { select: { title: true } }, user: { select: { displayName: true } } },
      orderBy: { completedAt: 'desc' },
      take: 50,
    });
    return rows.map((r) => ({
      id: r.id,
      taskId: r.taskId,
      userId: r.userId,
      completedAt: r.completedAt,
      taskTitle: r.task.title,
      userDisplayName: r.user.displayName,
    }));
  }

  // ── Streaks ───────────────────────────────────────────────────────────────────

  async findStreak(taskId: string, userId: string): Promise<TaskStreak | null> {
    const row = await this.prisma.taskStreak.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });
    return row ? new TaskStreak(row) : null;
  }

  async upsertStreak(taskId: string, userId: string): Promise<TaskStreak> {
    const existing = await this.findStreak(taskId, userId);
    const now = new Date();

    if (!existing) {
      const row = await this.prisma.taskStreak.create({
        data: { taskId, userId, current: 1, best: 1, lastCompletedAt: now },
      });
      return new TaskStreak(row);
    }

    // Check if last completion was yesterday (consecutive day)
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive =
      existing.lastCompletedAt !== null &&
      existing.lastCompletedAt.toDateString() === yesterday.toDateString();

    const newCurrent = isConsecutive ? existing.current + 1 : 1;
    const newBest = Math.max(existing.best, newCurrent);

    const row = await this.prisma.taskStreak.update({
      where: { userId_taskId: { userId, taskId } },
      data: { current: newCurrent, best: newBest, lastCompletedAt: now },
    });
    return new TaskStreak(row);
  }
}
