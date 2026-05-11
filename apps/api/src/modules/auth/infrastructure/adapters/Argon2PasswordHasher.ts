import argon2 from 'argon2';
import type { IPasswordHasher } from '../../domain/ports/IPasswordHasher.js';

export class Argon2PasswordHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain);
  }

  async verify(plain: string, hashed: string): Promise<boolean> {
    return argon2.verify(hashed, plain);
  }
}
