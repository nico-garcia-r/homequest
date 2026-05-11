import type { PrismaClient } from '@prisma/client';
import type { IRewardRepository } from '../../domain/ports/IRewardRepository.js';
import { Reward, RewardRedemption } from '../../domain/entities/Reward.js';

export class PrismaRewardRepository implements IRewardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Reward | null> {
    const row = await this.prisma.reward.findUnique({ where: { id } });
    return row ? new Reward(row) : null;
  }

  async findByHousehold(householdId: string): Promise<Reward[]> {
    const rows = await this.prisma.reward.findMany({
      where: { householdId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => new Reward(r));
  }

  async create(data: {
    title: string;
    description?: string;
    pointCost: number;
    householdId: string;
  }): Promise<Reward> {
    const row = await this.prisma.reward.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        pointCost: data.pointCost,
        householdId: data.householdId,
      },
    });
    return new Reward(row);
  }

  async redeem(rewardId: string, userId: string): Promise<RewardRedemption> {
    const row = await this.prisma.rewardRedemption.create({ data: { rewardId, userId } });
    return new RewardRedemption(row);
  }
}
