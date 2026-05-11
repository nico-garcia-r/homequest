import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaAchievementRepository } from '../persistence/PrismaAchievementRepository.js';
import { CheckAchievementsUseCase } from '../../application/use-cases/CheckAchievementsUseCase.js';

export async function achievementRoutes(app: FastifyInstance) {
  const repo = new PrismaAchievementRepository(app.prisma);

  app.get(
    '/users/:userId/achievements',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { userId } = req.params as { userId: string };
      const { sub } = req.user as { sub: string };
      if (sub !== userId) return reply.status(403).send({ error: 'FORBIDDEN' });

      const progress = await repo.findProgress(userId);
      return reply.send(
        progress.map((p) => ({
          id: p.achievement.id,
          title: p.achievement.title,
          description: p.achievement.description,
          badgeIcon: p.achievement.badgeIcon,
          isUnlocked: p.isUnlocked,
          progress: p.progress,
          conditionValue: p.achievement.conditionValue,
          unlockedAt: p.unlockedAt,
        })),
      );
    },
  );

  app.post(
    '/users/:userId/achievements/check',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { userId } = req.params as { userId: string };
      const { sub } = req.user as { sub: string };
      if (sub !== userId) return reply.status(403).send({ error: 'FORBIDDEN' });

      const newlyUnlocked = await new CheckAchievementsUseCase(repo).execute(userId);
      return reply.send({ newlyUnlocked });
    },
  );
}
