import type { PrismaClient } from '@prisma/client';
import type { IPointRepository } from '../../domain/ports/IPointRepository.js';
import { PointLedgerEntry } from '../../domain/entities/PointLedgerEntry.js';

export class PrismaPointRepository implements IPointRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async grant(data: {
    userId: string;
    amount: number;
    reason: string;
    refId?: string;
  }): Promise<PointLedgerEntry> {
    const row = await this.prisma.pointLedgerEntry.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        reason: data.reason,
        refId: data.refId ?? null,
      },
    });
    return new PointLedgerEntry(row);
  }

  async spend(data: {
    userId: string;
    amount: number;
    reason: string;
    refId?: string;
  }): Promise<PointLedgerEntry> {
    const row = await this.prisma.pointLedgerEntry.create({
      data: {
        userId: data.userId,
        amount: -data.amount,
        reason: data.reason,
        refId: data.refId ?? null,
      },
    });
    return new PointLedgerEntry(row);
  }

  async getBalance(userId: string): Promise<number> {
    const result = await this.prisma.pointLedgerEntry.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }

  async getHistory(userId: string): Promise<PointLedgerEntry[]> {
    const rows = await this.prisma.pointLedgerEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => new PointLedgerEntry(r));
  }
}
