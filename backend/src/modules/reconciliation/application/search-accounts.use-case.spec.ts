import { SearchAccountsUseCase } from './search-accounts.use-case';
import { InMemoryReconciliationRepository } from '../infrastructure/in-memory-reconciliation.repository';
import { Reconciliation } from '../domain/reconciliation.entity';
import { Account } from '../domain/account.entity';

describe('SearchAccountsUseCase', () => {
  let repository: InMemoryReconciliationRepository;
  let useCase: SearchAccountsUseCase;

  beforeEach(() => {
    repository = new InMemoryReconciliationRepository();
    useCase = new SearchAccountsUseCase(repository);
  });

  it('should return accounts that match the search query', async () => {
    const reconciliation = new Reconciliation('R1', 'file.json', new Date(), [
      new Account('A1', 'Cash Ledger', 1000, 1000, []),
      new Account('A2', 'Bank Account', 2000, 2000, []),
    ]);
    await repository.create(reconciliation);

    const result = await useCase.execute('cash');

    expect(result.length).toBe(1);
    expect(result[0].id).toBe('A1');
    expect(result[0].name).toContain('Cash');
  });

  it('should return an empty array when no accounts match', async () => {
    const reconciliation = new Reconciliation('R2', 'file2.json', new Date(), [
      new Account('A3', 'Revenue', 500, 500, []),
    ]);
    await repository.create(reconciliation);

    const result = await useCase.execute('missing');

    expect(result).toEqual([]);
  });
});
