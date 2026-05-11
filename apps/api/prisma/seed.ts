import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const achievements = [
    // ── Tasks completed ──────────────────────────────────────────────────────
    {
      id: 'first-step',
      title: 'First Step',
      description: 'Complete your first quest',
      conditionType: 'tasks_completed',
      conditionValue: 1,
      badgeIcon: '🎯',
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Complete 5 quests',
      conditionType: 'tasks_completed',
      conditionValue: 5,
      badgeIcon: '⭐',
    },
    {
      id: 'task-master',
      title: 'Quest Master',
      description: 'Complete 25 quests',
      conditionType: 'tasks_completed',
      conditionValue: 25,
      badgeIcon: '🏆',
    },
    {
      id: 'centurion',
      title: 'Centurion',
      description: 'Complete 100 quests',
      conditionType: 'tasks_completed',
      conditionValue: 100,
      badgeIcon: '💯',
    },
    // ── Points earned ────────────────────────────────────────────────────────
    {
      id: 'point-earner',
      title: 'First Gold',
      description: 'Earn 50 points',
      conditionType: 'points_earned',
      conditionValue: 50,
      badgeIcon: '🪙',
    },
    {
      id: 'high-scorer',
      title: 'High Scorer',
      description: 'Earn 500 points',
      conditionType: 'points_earned',
      conditionValue: 500,
      badgeIcon: '💎',
    },
    {
      id: 'point-legend',
      title: 'Point Legend',
      description: 'Earn 1000 points',
      conditionType: 'points_earned',
      conditionValue: 1000,
      badgeIcon: '👑',
    },
    // ── Streaks ──────────────────────────────────────────────────────────────
    {
      id: 'week-warrior',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak on any recurring quest',
      conditionType: 'streak',
      conditionValue: 7,
      badgeIcon: '🔥',
    },
    {
      id: 'committed',
      title: 'Committed',
      description: 'Maintain a 30-day streak on any recurring quest',
      conditionType: 'streak',
      conditionValue: 30,
      badgeIcon: '⚡',
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { id: achievement.id },
      update: {
        title: achievement.title,
        description: achievement.description,
        badgeIcon: achievement.badgeIcon,
      },
      create: achievement,
    });
  }

  console.log('✅ Seeded achievements');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
