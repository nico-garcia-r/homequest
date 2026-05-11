export type MemberRole = 'ADMIN' | 'MEMBER';

export interface HouseholdProps {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HouseholdMemberProps {
  id: string;
  userId: string;
  householdId: string;
  role: MemberRole;
  joinedAt: Date;
}

export class Household {
  constructor(private readonly props: HouseholdProps) {}

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get createdAt() {
    return this.props.createdAt;
  }
}

export class HouseholdMember {
  constructor(private readonly props: HouseholdMemberProps) {}

  get id() {
    return this.props.id;
  }
  get userId() {
    return this.props.userId;
  }
  get householdId() {
    return this.props.householdId;
  }
  get role() {
    return this.props.role;
  }
  get isAdmin() {
    return this.props.role === 'ADMIN';
  }
}
