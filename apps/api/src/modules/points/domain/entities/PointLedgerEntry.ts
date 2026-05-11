export interface PointLedgerEntryProps {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  refId: string | null;
  createdAt: Date;
}

export class PointLedgerEntry {
  constructor(private readonly props: PointLedgerEntryProps) {}

  get id() {
    return this.props.id;
  }
  get userId() {
    return this.props.userId;
  }
  get amount() {
    return this.props.amount;
  }
  get reason() {
    return this.props.reason;
  }
  get refId() {
    return this.props.refId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
}
