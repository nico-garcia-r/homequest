import type { Achievement, AchievementProgress } from '../entities/Achievement.js';

export interface ProgressView {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date | null;
  progress: number;
  isUnlocked: boolean;
  achievement: Achievement;
}

export interface IAchievementRepository {
  findAll(): Promise<Achievement[]>;
  findProgress(userId: string): Promise<ProgressView[]>;
  upsertProgress(data: {
    userId: string;
    achievementId: string;
    progress: number;
    unlockedAt?: Date;
  }): Promise<AchievementProgress>;
  getTaskCompletionCount(userId: string): Promise<number>;
  getPointsTotal(userId: string): Promise<number>;
  getBestStreak(userId: string): Promise<number>;
}
