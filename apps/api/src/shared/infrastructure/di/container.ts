import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS } from './tokens.js';
import { loadEnv } from '../config/env.js';
import { getPrismaClient } from '../prisma/client.js';

// The composition root: register concrete implementations against ports.
// This file is the ONLY place that knows about every concrete adapter.
export function buildContainer() {
  const env = loadEnv();

  container.register(TOKENS.Env, { useValue: env });
  container.register(TOKENS.Prisma, { useValue: getPrismaClient() });

  // Auth module wiring will be added when we implement the module.
  // Example (for the next step):
  //   container.register(TOKENS.UserRepository, { useClass: PrismaUserRepository });
  //   container.register(TOKENS.PasswordHasher, { useClass: Argon2PasswordHasher });
  //   container.register(TOKENS.TokenService, { useClass: JwtTokenService });

  return container;
}
