import type { PrismaClient } from '@prisma/client';
import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import { User } from '../../domain/entities/User.js';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? this.toEntity(row) : null;
  }

  async create(data: { email: string; passwordHash: string; displayName: string }): Promise<User> {
    const row = await this.prisma.user.create({ data });
    return this.toEntity(row);
  }

  private toEntity(row: {
    id: string;
    email: string;
    passwordHash: string;
    displayName: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(row);
  }
}
