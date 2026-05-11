import type { Task, TaskCompletion, TaskStreak } from '../entities/Task.js';
import type { Difficulty, RecurrenceType, TaskScope } from '../entities/Task.js';

export interface CompletionView {
  id: string;
  taskId: string;
  userId: string;
  completedAt: Date;
  taskTitle: string;
  userDisplayName: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  points: number;
  householdId?: string;
  createdById: string;
  scope: TaskScope;
  category?: string;
  difficulty: Difficulty;
  recurrenceType: RecurrenceType;
  recurrenceDays?: string;
}

export interface ITaskRepository {
  // ── Queries ──────────────────────────────────────────────────────────────────
  findById(id: string): Promise<Task | null>;
  findByHousehold(householdId: string): Promise<Task[]>;
  findByUser(userId: string): Promise<Task[]>;

  // ── Mutations ─────────────────────────────────────────────────────────────────
  create(data: CreateTaskData): Promise<Task>;

  // ── Completions ───────────────────────────────────────────────────────────────
  findCompletionToday(taskId: string, userId: string): Promise<TaskCompletion | null>;
  findCompletionEver(taskId: string, userId: string): Promise<TaskCompletion | null>;
  complete(taskId: string, userId: string): Promise<TaskCompletion>;
  findCompletionsForHousehold(householdId: string): Promise<CompletionView[]>;
  findCompletionsForUser(userId: string): Promise<CompletionView[]>;

  // ── Streaks ───────────────────────────────────────────────────────────────────
  findStreak(taskId: string, userId: string): Promise<TaskStreak | null>;
  upsertStreak(taskId: string, userId: string): Promise<TaskStreak>;
}
