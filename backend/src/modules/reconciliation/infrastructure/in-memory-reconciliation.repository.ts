import { Injectable } from '@nestjs/common';
import { Reconciliation } from '../domain/reconciliation.entity';
import { Account } from '../domain/account.entity';
import { IReconciliationRepository } from '../domain/reconciliation.repository.interface';

@Injectable()
export class InMemoryReconciliationRepository implements IReconciliationRepository {
  private readonly reconciliations = new Map<string, Reconciliation>();

  async create(reconciliation: Reconciliation): Promise<Reconciliation> {
    this.reconciliations.set(reconciliation.id, reconciliation);
    return reconciliation;
  }

  async findById(id: string): Promise<Reconciliation | null> {
    return this.reconciliations.get(id) ?? null;
  }

  async findAll(): Promise<Reconciliation[]> {
    return Array.from(this.reconciliations.values());
  }

  async findAccountById(accountId: string): Promise<Account | null> {
    for (const reconciliation of this.reconciliations.values()) {
      const account = reconciliation.accounts.find((account) => account.id === accountId);
      if (account) {
        return account;
      }
    }

    return null;
  }

  async searchAccounts(query: string): Promise<Account[]> {
    const normalizedQuery = query.trim().toLowerCase();
    const accounts: Account[] = [];

    this.reconciliations.forEach((reconciliation) => {
      reconciliation.accounts.forEach((account) => {
        if (
          account.id.toLowerCase().includes(normalizedQuery) ||
          account.name.toLowerCase().includes(normalizedQuery)
        ) {
          accounts.push(account);
        }
      });
    });

    return accounts;
  }

  async listAllAccounts(): Promise<Account[]> {
    return Array.from(this.reconciliations.values()).flatMap((reconciliation) => reconciliation.accounts);
  }
}
