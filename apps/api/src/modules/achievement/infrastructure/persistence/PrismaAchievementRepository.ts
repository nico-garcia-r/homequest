import type { PrismaClient } from '@prisma/client';
import type {
  IAchievementRepository,
  ProgressView,
} from '../../domain/ports/IAchievementRepository.js';
import { Achievement, AchievementProgress } from '../../domain/entities/Achievement.js';

export class PrismaAchievementRepository implements IAchievementRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Achievement[]> {
    const rows = await this.prisma.achievement.findMany();
    return rows.map((r) => new Achievement(r));
  }

  async findProgress(userId: string): Promise<ProgressView[]> {
    const rows = await this.prisma.achievementProgress.findMany({
      where: { userId },
      include: { achievement: true },
    });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      achievementId: r.achievementId,
      unlockedAt: r.unlockedAt,
      progress: r.progress,
      isUnlocked: r.unlockedAt !== null,
      achievement: new Achievement(r.achievement),
    }));
  }

  async upsertProgress(data: {
    userId: string;
    achievementId: string;
    progress: number;
    unlockedAt?: Date;
  }): Promise<AchievementProgress> {
    const row = await this.prisma.achievementProgress.upsert({
      where: { userId_achievementId: { userId: data.userId, achievementId: data.achievementId } },
      update: { progress: data.progress, unlockedAt: data.unlockedAt ?? null },
      create: {
        userId: data.userId,
        achievementId: data.achievementId,
        progress: data.progress,
        unlockedAt: data.unlockedAt ?? null,
      },
    });
    return new AchievementProgress(row);
  }

  async getTaskCompletionCount(userId: string): Promise<number> {
    return this.prisma.taskCompletion.count({ where: { userId } });
  }

  async getPointsTotal(userId: string): Promise<number> {
    const result = await this.prisma.pointLedgerEntry.aggregate({
      where: { userId, amount: { gt: 0 } },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }

  async getBestStreak(userId: string): Promise<number> {
    const result = await this.prisma.taskStreak.aggregate({
      where: { userId },
      _max: { best: true },
    });
    return result._max?.best ?? 0;
  }
}
