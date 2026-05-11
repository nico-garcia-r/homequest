import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase.js';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase.js';
import { GetMeUseCase } from '../../application/use-cases/GetMeUseCase.js';
import { PrismaUserRepository } from '../persistence/PrismaUserRepository.js';
import { Argon2PasswordHasher } from '../adapters/Argon2PasswordHasher.js';
import { mapDomainError } from '../../../../shared/infrastructure/http/errorMapper.js';

const RegisterBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(64),
});

const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  const prisma = app.prisma;
  const userRepo = new PrismaUserRepository(prisma);
  const hasher = new Argon2PasswordHasher();

  app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = RegisterBodySchema.safeParse(request.body);
    if (!body.success)
      return reply.status(400).send({ error: 'VALIDATION_ERROR', details: body.error.flatten() });

    const useCase = new RegisterUseCase(userRepo, hasher);
    const result = await useCase.execute(body.data);
    if (!result.ok)
      return reply
        .status(mapDomainError(result.error))
        .send({ error: result.error.code, message: result.error.message });

    const token = app.jwt.sign({ sub: result.value.id, email: result.value.email });
    return reply.status(201).send({ token, user: result.value });
  });

  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = LoginBodySchema.safeParse(request.body);
    if (!body.success)
      return reply.status(400).send({ error: 'VALIDATION_ERROR', details: body.error.flatten() });

    const useCase = new LoginUseCase(userRepo, hasher);
    const result = await useCase.execute(body.data);
    if (!result.ok)
      return reply
        .status(mapDomainError(result.error))
        .send({ error: result.error.code, message: result.error.message });

    const token = app.jwt.sign({ sub: result.value.id, email: result.value.email });
    return reply.send({ token, user: result.value });
  });

  app.get(
    '/me',
    { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const payload = request.user as { sub: string };
      const useCase = new GetMeUseCase(userRepo);
      const result = await useCase.execute(payload.sub);
      if (!result.ok)
        return reply
          .status(mapDomainError(result.error))
          .send({ error: result.error.code, message: result.error.message });
      return reply.send({ user: result.value });
    },
  );
}
