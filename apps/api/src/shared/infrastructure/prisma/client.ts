import { PrismaClient } from '@prisma/client';

// Singleton Prisma client. The DI container resolves this token
// so adapters never `new PrismaClient()` themselves.
let instance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!instance) {
    instance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return instance;
}

export type { PrismaClient };
