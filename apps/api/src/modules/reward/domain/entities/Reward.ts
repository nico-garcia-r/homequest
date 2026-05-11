export interface RewardProps {
  id: string;
  title: string;
  description: string | null;
  pointCost: number;
  householdId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardRedemptionProps {
  id: string;
  rewardId: string;
  userId: string;
  redeemedAt: Date;
}

export class Reward {
  constructor(private readonly props: RewardProps) {}

  get id() {
    return this.props.id;
  }
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get pointCost() {
    return this.props.pointCost;
  }
  get householdId() {
    return this.props.householdId;
  }
}

export class RewardRedemption {
  constructor(private readonly props: RewardRedemptionProps) {}

  get id() {
    return this.props.id;
  }
  get rewardId() {
    return this.props.rewardId;
  }
  get userId() {
    return this.props.userId;
  }
  get redeemedAt() {
    return this.props.redeemedAt;
  }
}
