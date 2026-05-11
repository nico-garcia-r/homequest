import type { PrismaClient } from '@prisma/client';
import type {
  IHouseholdRepository,
  HouseholdWithMembers,
  MemberView,
} from '../../domain/ports/IHouseholdRepository.js';
import { Household, HouseholdMember, type MemberRole } from '../../domain/entities/Household.js';

export class PrismaHouseholdRepository implements IHouseholdRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Household | null> {
    const row = await this.prisma.group.findUnique({ where: { id } });
    return row ? new Household(row) : null;
  }

  async findMember(userId: string, householdId: string): Promise<HouseholdMember | null> {
    const row = await this.prisma.groupMember.findUnique({
      where: { userId_householdId: { userId, householdId } },
    });
    return row ? new HouseholdMember({ ...row, role: row.role as MemberRole }) : null;
  }

  async findUserHouseholds(userId: string): Promise<Household[]> {
    const memberships = await this.prisma.groupMember.findMany({
      where: { userId },
      include: { group: true },
    });
    return memberships.map((m) => new Household(m.group));
  }

  async getWithMembers(id: string): Promise<HouseholdWithMembers | null> {
    const row = await this.prisma.group.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { displayName: true, email: true } } } },
      },
    });
    if (!row) return null;

    const household = new Household(row);
    const members: MemberView[] = row.members.map((m) => ({
      userId: m.userId,
      householdId: m.householdId,
      role: m.role as MemberRole,
      displayName: m.user.displayName,
      email: m.user.email,
    }));

    return { household, members };
  }

  async create(data: { name: string; creatorId: string }): Promise<Household> {
    const group = await this.prisma.group.create({
      data: {
        name: data.name,
        members: {
          create: { userId: data.creatorId, role: 'ADMIN' },
        },
      },
    });
    return new Household(group);
  }

  async addMember(data: {
    userId: string;
    householdId: string;
    role: MemberRole;
  }): Promise<HouseholdMember> {
    const row = await this.prisma.groupMember.create({ data });
    return new HouseholdMember({ ...row, role: row.role as MemberRole });
  }
}
