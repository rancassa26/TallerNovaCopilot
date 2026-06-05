export class Account {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly ledgerBalance: number,
    public readonly systemBalance: number,
    public readonly incidents: AccountIncident[] = [],
  ) {}

  get difference(): number {
    return this.systemBalance - this.ledgerBalance;
  }
}

export class AccountIncident {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly type: string,
    public readonly description: string,
    public readonly amount: number,
  ) {}
}
