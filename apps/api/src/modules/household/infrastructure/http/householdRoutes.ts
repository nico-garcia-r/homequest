import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CreateHouseholdUseCase } from '../../application/use-cases/CreateHouseholdUseCase.js';
import { JoinHouseholdUseCase } from '../../application/use-cases/JoinHouseholdUseCase.js';
import { GetHouseholdUseCase } from '../../application/use-cases/GetHouseholdUseCase.js';
import { PrismaHouseholdRepository } from '../persistence/PrismaHouseholdRepository.js';
import { mapDomainError } from '../../../../shared/infrastructure/http/errorMapper.js';

const CreateBodySchema = z.object({ name: z.string().min(1).max(64) });

export async function householdRoutes(app: FastifyInstance) {
  const repo = new PrismaHouseholdRepository(app.prisma);

  app.post(
    '/',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const body = CreateBodySchema.safeParse(req.body);
      if (!body.success)
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: body.error.flatten() });

      const { sub } = req.user as { sub: string };
      const result = await new CreateHouseholdUseCase(repo).execute({
        name: body.data.name,
        creatorId: sub,
      });
      if (!result.ok)
        return reply
          .status(mapDomainError(result.error))
          .send({ error: result.error.code, message: result.error.message });
      return reply.status(201).send(result.value);
    },
  );

  app.post(
    '/:id/join',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      const { sub } = req.user as { sub: string };
      const result = await new JoinHouseholdUseCase(repo).execute({ userId: sub, householdId: id });
      if (!result.ok)
        return reply
          .status(mapDomainError(result.error))
          .send({ error: result.error.code, message: result.error.message });
      return reply.send(result.value);
    },
  );

  app.get(
    '/:id',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      const { sub } = req.user as { sub: string };
      const result = await new GetHouseholdUseCase(repo).execute(id, sub);
      if (!result.ok)
        return reply
          .status(mapDomainError(result.error))
          .send({ error: result.error.code, message: result.error.message });
      return reply.send(result.value);
    },
  );

  app.get(
    '/my',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { sub } = req.user as { sub: string };
      const households = await repo.findUserHouseholds(sub);
      return reply.send(households.map((h) => ({ id: h.id, name: h.name })));
    },
  );
}
