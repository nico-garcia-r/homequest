import Fastify, { type FastifyInstance, type FastifyRequest, type FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import type { Env } from '../config/env.js';
import type { PrismaClient } from '@prisma/client';
import { authRoutes } from '../../../modules/auth/infrastructure/http/authRoutes.js';
import { householdRoutes } from '../../../modules/household/infrastructure/http/householdRoutes.js';
import { taskRoutes } from '../../../modules/task/infrastructure/http/taskRoutes.js';
import { pointsRoutes } from '../../../modules/points/infrastructure/http/pointsRoutes.js';
import { rewardRoutes } from '../../../modules/reward/infrastructure/http/rewardRoutes.js';
import { achievementRoutes } from '../../../modules/achievement/infrastructure/http/achievementRoutes.js';

export async function buildServer(env: Env, prisma: PrismaClient): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
            }
          : undefined,
    },
  });

  await app.register(helmet);
  await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
  await app.register(jwt, { secret: env.JWT_SECRET });

  app.decorate('prisma', prisma);
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Invalid or missing token' });
    }
  });

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(householdRoutes, { prefix: '/api/households' });
  await app.register(taskRoutes, { prefix: '/api' });
  await app.register(pointsRoutes, { prefix: '/api' });
  await app.register(rewardRoutes, { prefix: '/api' });
  await app.register(achievementRoutes, { prefix: '/api' });

  return app;
}
