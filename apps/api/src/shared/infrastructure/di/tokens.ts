// Inversion-of-control tokens. Using symbols keeps them unique and explicit.
// Each module declares its own ports here so the composition root can wire them.

export const TOKENS = {
  // Shared
  Env: Symbol.for('Env'),
  Prisma: Symbol.for('Prisma'),
  Logger: Symbol.for('Logger'),

  // Auth module
  UserRepository: Symbol.for('UserRepository'),
  PasswordHasher: Symbol.for('PasswordHasher'),
  TokenService: Symbol.for('TokenService'),
} as const;
