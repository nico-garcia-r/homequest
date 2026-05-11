import 'reflect-metadata';
import { buildContainer } from './shared/infrastructure/di/container.js';
import { TOKENS } from './shared/infrastructure/di/tokens.js';
import { buildServer } from './shared/infrastructure/http/server.js';
import type { Env } from './shared/infrastructure/config/env.js';
import type { PrismaClient } from '@prisma/client';

async function main() {
  const container = buildContainer();
  const env = container.resolve<Env>(TOKENS.Env);
  const prisma = container.resolve<PrismaClient>(TOKENS.Prisma);
  const app = await buildServer(env, prisma);

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`🏠 HomeQuest API listening on http://localhost:${env.PORT}`);
  } catch (e) {
    app.log.error(e);
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down...`);
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
