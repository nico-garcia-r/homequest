import type { Household, HouseholdMember, MemberRole } from '../entities/Household.js';

export interface MemberView {
  userId: string;
  householdId: string;
  role: MemberRole;
  displayName: string;
  email: string;
}

export interface HouseholdWithMembers {
  household: Household;
  members: MemberView[];
}

export interface IHouseholdRepository {
  findById(id: string): Promise<Household | null>;
  findMember(userId: string, householdId: string): Promise<HouseholdMember | null>;
  findUserHouseholds(userId: string): Promise<Household[]>;
  getWithMembers(id: string): Promise<HouseholdWithMembers | null>;
  create(data: { name: string; creatorId: string }): Promise<Household>;
  addMember(data: {
    userId: string;
    householdId: string;
    role: MemberRole;
  }): Promise<HouseholdMember>;
}
