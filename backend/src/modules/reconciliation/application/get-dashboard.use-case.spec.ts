import { GetDashboardUseCase } from './get-dashboard.use-case';
import { InMemoryReconciliationRepository } from '../infrastructure/in-memory-reconciliation.repository';
import { Reconciliation } from '../domain/reconciliation.entity';
import { Account } from '../domain/account.entity';

describe('GetDashboardUseCase', () => {
  let repository: InMemoryReconciliationRepository;
  let useCase: GetDashboardUseCase;

  beforeEach(() => {
    repository = new InMemoryReconciliationRepository();
    useCase = new GetDashboardUseCase(repository);
  });

  it('should aggregate dashboard metrics from existing reconciliations', async () => {
    const reconciliationA = new Reconciliation('R1', 'file1.json', new Date(), [
      new Account('A1', 'Cash', 1000, 950, []),
      new Account('A2', 'Bank', 2000, 2000, []),
    ]);
    const reconciliationB = new Reconciliation('R2', 'file2.json', new Date(), [
      new Account('A3', 'Savings', 1500, 1480, []),
    ]);

    await repository.create(reconciliationA);
    await repository.create(reconciliationB);

    const result = await useCase.execute();

    expect(result.totalReconciliations).toBe(2);
    expect(result.totalAccounts).toBe(3);
    expect(result.totalIncidents).toBe(0);
    expect(result.totalDifference).toBe(-70);
  });
});
