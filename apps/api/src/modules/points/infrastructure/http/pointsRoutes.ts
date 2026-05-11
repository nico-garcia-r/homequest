import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaPointRepository } from '../persistence/PrismaPointRepository.js';

export async function pointsRoutes(app: FastifyInstance) {
  const repo = new PrismaPointRepository(app.prisma);

  app.get(
    '/users/:userId/points',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { userId } = req.params as { userId: string };
      const { sub } = req.user as { sub: string };

      if (sub !== userId)
        return reply
          .status(403)
          .send({ error: 'FORBIDDEN', message: 'Cannot access other users points' });

      const [balance, history] = await Promise.all([
        repo.getBalance(userId),
        repo.getHistory(userId),
      ]);
      return reply.send({
        balance,
        history: history.map((e) => ({
          id: e.id,
          amount: e.amount,
          reason: e.reason,
          createdAt: e.createdAt,
        })),
      });
    },
  );
}
