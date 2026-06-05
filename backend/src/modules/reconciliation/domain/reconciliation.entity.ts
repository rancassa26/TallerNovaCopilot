import { Account } from './account.entity';

export class Reconciliation {
  constructor(
    public readonly id: string,
    public readonly source: string,
    public readonly loadedAt: Date,
    public readonly accounts: Account[],
  ) {}

  get totalAccounts(): number {
    return this.accounts.length;
  }

  get totalDifference(): number {
    return this.accounts.reduce((sum, account) => sum + account.difference, 0);
  }

  get totalIncidents(): number {
    return this.accounts.reduce((sum, account) => sum + account.incidents.length, 0);
  }
}
