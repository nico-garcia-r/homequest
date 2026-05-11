import type { PointLedgerEntry } from '../entities/PointLedgerEntry.js';

export interface IPointRepository {
  grant(data: {
    userId: string;
    amount: number;
    reason: string;
    refId?: string;
  }): Promise<PointLedgerEntry>;
  spend(data: {
    userId: string;
    amount: number;
    reason: string;
    refId?: string;
  }): Promise<PointLedgerEntry>;
  getBalance(userId: string): Promise<number>;
  getHistory(userId: string): Promise<PointLedgerEntry[]>;
}
