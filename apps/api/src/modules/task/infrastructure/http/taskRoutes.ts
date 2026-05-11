import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CreateTaskUseCase } from '../../application/use-cases/CreateTaskUseCase.js';
import { ListTasksUseCase } from '../../application/use-cases/ListTasksUseCase.js';
import { CompleteTaskUseCase } from '../../application/use-cases/CompleteTaskUseCase.js';
import { PrismaTaskRepository } from '../persistence/PrismaTaskRepository.js';
import { PrismaHouseholdRepository } from '../../../household/infrastructure/persistence/PrismaHouseholdRepository.js';
import { PrismaPointRepository } from '../../../points/infrastructure/persistence/PrismaPointRepository.js';
import { mapDomainError } from '../../../../shared/infrastructure/http/errorMapper.js';
import type { RecurrenceType } from '../../domain/entities/Task.js';

// ── Schemas ───────────────────────────────────────────────────────────────────

const DifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD', 'EPIC']).default('MEDIUM');
const RecurrenceSchema = z.enum(['NONE', 'DAILY', 'WEEKDAYS', 'WEEKLY', 'CUSTOM']).default('NONE');

/** Accepts both the new fields AND legacy `recurring: boolean` for backward compat */
const CreateTaskBodySchema = z
  .object({
    title: z.string().min(1).max(128),
    description: z.string().max(512).optional(),
    difficulty: DifficultySchema,
    category: z.string().max(64).optional(),
    scope: z.enum(['PERSONAL', 'SHARED']).optional(),
    recurrenceType: RecurrenceSchema,
    recurrenceDays: z.string().optional(),
    // Legacy: frontend still sends these during Phase 1 → mapped internally
    recurring: z.boolean().optional(),
    points: z.number().int().min(1).max(1000).optional(),
  })
  .transform((data) => {
    // Map legacy `recurring` to recurrenceType if recurrenceType not explicitly set
    let recurrenceType = data.recurrenceType;
    if (data.recurring === true && data.recurrenceType === 'NONE') recurrenceType = 'DAILY';
    if (data.recurring === false && data.recurrenceType !== 'NONE') recurrenceType = 'NONE';
    return { ...data, recurrenceType: recurrenceType as RecurrenceType };
  });

// ── Routes ────────────────────────────────────────────────────────────────────

export async function taskRoutes(app: FastifyInstance) {
  const taskRepo = new PrismaTaskRepository(app.prisma);
  const householdRepo = new PrismaHouseholdRepository(app.prisma);
  const pointRepo = new PrismaPointRepository(app.prisma);

  // ── Personal tasks ──────────────────────────────────────────────────────────

  /** GET /tasks/mine — personal quests for the current user */
  app.get(
    '/tasks/mine',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { sub } = req.user as { sub: string };
      const result = await new ListTasksUseCase(taskRepo, householdRepo).executePersonal(sub);
      if (!result.ok)
        return reply
          .status(mapDomainError(result.error))
          .send({ error: result.error.code, message: result.error.message });
      return reply.send(result.value);
    },
  );

  /** POST /tasks — create a personal quest (no householdId needed) */
  app.post(
    '/tasks',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { sub } = req.user as { sub: string };
      const body = CreateTaskBodySchema.safeParse(req.body);
      if (!body.success)
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: body.error.flatten() });

      const result = await new CreateTaskUseCase(taskRepo, householdRepo).execute({
        ...body.data,
        createdById: sub,
      });
      if (!result.ok)
        return reply
          .status(mapDomainError(result.error))
          .send({ error: result.error.code, message: result.error.message });
      return reply.status(201).send(result.value);
    },
  );

  /** GET /tasks/mine/activity — recent completions for personal quests */
  app.get(
    '/tasks/mine/activity',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { sub } = req.user as { sub: string };
      const completions = await taskRepo.findCompletionsForUser(sub);
      return reply.send(completions);
    },
  );

  // ── Household tasks (group quests) ──────────────────────────────────────────

  /** POST /households/:householdId/tasks — create a shared quest */
  app.post(
    '/households/:householdId/tasks',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { householdId } = req.params as { householdId: string };
      const { sub } = req.user as { sub: string };
      const body = CreateTaskBodySchema.safeParse(req.body);
      if (!body.success)
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: body.error.flatten() });

      const result = await new CreateTaskUseCase(taskRepo, householdRepo).execute({
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

  /** GET /households/:householdId/tasks — list shared quests */
  app.get(
    '/households/:householdId/tasks',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { householdId } = req.params as { householdId: string };
      const { sub } = req.user as { sub: string };
      const result = await new ListTasksUseCase(taskRepo, householdRepo).execute(householdId, sub);
      if (!result.ok)
        return reply
          .status(mapDomainError(result.error))
          .send({ error: result.error.code, message: result.error.message });
      return reply.send(result.value);
    },
  );

  // ── Complete a quest (works for both personal and shared) ───────────────────

  /** POST /tasks/:taskId/complete */
  app.post(
    '/tasks/:taskId/complete',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { taskId } = req.params as { taskId: string };
      const { sub } = req.user as { sub: string };
      const result = await new CompleteTaskUseCase(taskRepo, pointRepo, householdRepo).execute(
        taskId,
        sub,
      );
      if (!result.ok)
        return reply
          .status(mapDomainError(result.error))
          .send({ error: result.error.code, message: result.error.message });
      return reply.send(result.value);
    },
  );

  // ── Activity feeds ──────────────────────────────────────────────────────────

  /** GET /households/:householdId/activity — recent group completions */
  app.get(
    '/households/:householdId/activity',
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { householdId } = req.params as { householdId: string };
      const completions = await taskRepo.findCompletionsForHousehold(householdId);
      return reply.send(completions);
    },
  );
}
