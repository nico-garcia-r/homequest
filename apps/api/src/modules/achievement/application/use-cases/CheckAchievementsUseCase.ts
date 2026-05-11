import type { IAchievementRepository } from '../../domain/ports/IAchievementRepository.js';

export interface UnlockedAchievement {
  id: string;
  title: string;
  badgeIcon: string | null;
}

export class CheckAchievementsUseCase {
  constructor(private readonly achievementRepo: IAchievementRepository) {}

  async execute(userId: string): Promise<UnlockedAchievement[]> {
    const [achievements, taskCount, pointsTotal, bestStreak, existingProgress] = await Promise.all([
      this.achievementRepo.findAll(),
      this.achievementRepo.getTaskCompletionCount(userId),
      this.achievementRepo.getPointsTotal(userId),
      this.achievementRepo.getBestStreak(userId),
      this.achievementRepo.findProgress(userId),
    ]);

    const unlockedNow: UnlockedAchievement[] = [];
    const progressMap = new Map(existingProgress.map((p) => [p.achievementId, p]));

    for (const achievement of achievements) {
      const existing = progressMap.get(achievement.id);
      if (existing?.isUnlocked) continue;

      let currentProgress = 0;
      if (achievement.conditionType === 'tasks_completed') {
        currentProgress = taskCount;
      } else if (achievement.conditionType === 'points_earned') {
        currentProgress = pointsTotal;
      } else if (achievement.conditionType === 'streak') {
        currentProgress = bestStreak;
      } else {
        // Unknown conditionType — skip gracefully
        continue;
      }

      const shouldUnlock = currentProgress >= achievement.conditionValue;
      await this.achievementRepo.upsertProgress({
        userId,
        achievementId: achievement.id,
        progress: currentProgress,
        unlockedAt: shouldUnlock ? new Date() : undefined,
      });

      if (shouldUnlock) {
        unlockedNow.push({
          id: achievement.id,
          title: achievement.title,
          badgeIcon: achievement.badgeIcon,
        });
      }
    }

    return unlockedNow;
  }
}
