export interface AchievementProps {
  id: string;
  title: string;
  description: string;
  conditionType: string;
  conditionValue: number;
  badgeIcon: string | null;
}

export interface AchievementProgressProps {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date | null;
  progress: number;
}

export class Achievement {
  constructor(private readonly props: AchievementProps) {}

  get id() {
    return this.props.id;
  }
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get conditionType() {
    return this.props.conditionType;
  }
  get conditionValue() {
    return this.props.conditionValue;
  }
  get badgeIcon() {
    return this.props.badgeIcon;
  }
}

export class AchievementProgress {
  constructor(private readonly props: AchievementProgressProps) {}

  get id() {
    return this.props.id;
  }
  get userId() {
    return this.props.userId;
  }
  get achievementId() {
    return this.props.achievementId;
  }
  get unlockedAt() {
    return this.props.unlockedAt;
  }
  get progress() {
    return this.props.progress;
  }
  get isUnlocked() {
    return this.props.unlockedAt !== null;
  }
}
