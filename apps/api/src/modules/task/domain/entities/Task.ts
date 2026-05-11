export type TaskScope = 'PERSONAL' | 'SHARED';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'CUSTOM';

export const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
  EPIC: 100,
};

export interface TaskProps {
  id: string;
  title: string;
  description: string | null;
  points: number;
  householdId: string | null;
  createdById: string;
  scope: TaskScope;
  category: string | null;
  difficulty: Difficulty;
  recurrenceType: RecurrenceType;
  recurrenceDays: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCompletionProps {
  id: string;
  taskId: string;
  userId: string;
  completedAt: Date;
}

export interface TaskStreakProps {
  id: string;
  userId: string;
  taskId: string;
  current: number;
  best: number;
  lastCompletedAt: Date | null;
}

export class Task {
  constructor(private readonly props: TaskProps) {}

  get id() {
    return this.props.id;
  }
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get points() {
    return this.props.points;
  }
  get householdId() {
    return this.props.householdId;
  }
  get createdById() {
    return this.props.createdById;
  }
  get scope() {
    return this.props.scope;
  }
  get category() {
    return this.props.category;
  }
  get difficulty() {
    return this.props.difficulty;
  }
  get recurrenceType() {
    return this.props.recurrenceType;
  }
  get recurrenceDays() {
    return this.props.recurrenceDays;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  /** True if this task should recur (not a one-time quest) */
  get isRecurring() {
    return this.props.recurrenceType !== 'NONE';
  }

  /** True if task belongs to a group */
  get isShared() {
    return this.props.scope === 'SHARED' && this.props.householdId !== null;
  }
}

export class TaskCompletion {
  constructor(private readonly props: TaskCompletionProps) {}

  get id() {
    return this.props.id;
  }
  get taskId() {
    return this.props.taskId;
  }
  get userId() {
    return this.props.userId;
  }
  get completedAt() {
    return this.props.completedAt;
  }
}

export class TaskStreak {
  constructor(private readonly props: TaskStreakProps) {}

  get id() {
    return this.props.id;
  }
  get userId() {
    return this.props.userId;
  }
  get taskId() {
    return this.props.taskId;
  }
  get current() {
    return this.props.current;
  }
  get best() {
    return this.props.best;
  }
  get lastCompletedAt() {
    return this.props.lastCompletedAt;
  }
}
