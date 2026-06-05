import { Reconciliation } from './reconciliation.entity';
import { Account } from './account.entity';

export interface IReconciliationRepository {
  create(reconciliation: Reconciliation): Promise<Reconciliation>;
  findById(id: string): Promise<Reconciliation | null>;
  findAll(): Promise<Reconciliation[]>;
  findAccountById(accountId: string): Promise<Account | null>;
  searchAccounts(query: string): Promise<Account[]>;
  listAllAccounts(): Promise<Account[]>;
}
