import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CreateRewardUseCase } from '../../application/use-cases/CreateRewardUseCase.js';
import { RedeemRewardUseCase } from '../../application/use-cases/RedeemRewardUseCase.js';
import { PrismaRewardRepository } from '../persistence/PrismaRewardRepository.js';
import { PrismaHouseholdRepository } from '../../../household/infrastructure/persistence/PrismaHouseholdRepository.js';
import { PrismaPointRepository } from '../../../points/infrastructure/persistence/PrismaPointRepository.js';
import { mapDomainError } from '../../../../shared/infrastructure/http/errorMapper.js';

const CreateRewardBodySchema = z.object({
  title: z.string().min(1).max(128),
  description: z.string().max(512).optional(),
  pointCost: z.number().int().min(1),
});

export async function rewardRoutes(app: FastifyInstance) {
  const rewardRepo = new PrismaRewardRepository(app.prisma);
  const householdRepo = new PrismaHouseholdRepository(app.prisma);
  const pointRepo = new PrismaPointRepository(app.prisma);

  app.post(
    '/households/:householdId/rewards',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { householdId } = req.params as { householdId: string };
      const { sub } = req.user as { sub: string };
      const body = CreateRewardBodySchema.safeParse(req.body);
      if (!body.success)
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: body.error.flatten() });

      const result = await new CreateRewardUseCase(rewardRepo, householdRepo).execute({
        ...body.data,
        householdId,
        createdById: sub,
      });
      if (!result.ok)
        return reply
          .status(mapDomainError(result.error))
          .send({ error: result.error.code, message: result.error.message });
      return reply.status(201).send(result.value);
    },
  );

  app.get(
    '/households/:householdId/rewards',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { householdId } = req.params as { householdId: string };
      const rewards = await rewardRepo.findByHousehold(householdId);
      return reply.send(
        rewards.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          pointCost: r.pointCost,
        })),
      );
    },
  );

  app.post(
    '/rewards/:rewardId/redeem',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { rewardId } = req.params as { rewardId: string };
      const { sub } = req.user as { sub: string };
      const result = await new RedeemRewardUseCase(rewardRepo, pointRepo, householdRepo).execute(
        rewardId,
        sub,
      );
      if (!result.ok)
        return reply
          .status(mapDomainError(result.error))
          .send({ error: result.error.code, message: result.error.message });
      return reply.send(result.value);
    },
  );
}
