import { ValidateReconciliationUseCase } from './validate-reconciliation.use-case';
import { InMemoryReconciliationRepository } from '../infrastructure/in-memory-reconciliation.repository';
import { Reconciliation } from '../domain/reconciliation.entity';
import { Account } from '../domain/account.entity';

describe('ValidateReconciliationUseCase', () => {
  let repository: InMemoryReconciliationRepository;
  let useCase: ValidateReconciliationUseCase;

  beforeEach(() => {
    repository = new InMemoryReconciliationRepository();
    useCase = new ValidateReconciliationUseCase(repository);
  });

  it('should validate a reconciliation and report balance mismatch issues', async () => {
    const reconciliation = new Reconciliation('R1', 'test.json', new Date(), [
      new Account('A1', 'Cash', 1000, 950, []),
      new Account('A2', 'Bank', 2000, 2000, []),
    ]);

    await repository.create(reconciliation);

    const result = await useCase.execute('R1', 'correlation-xyz');

    expect(result.reconciliationId).toBe('R1');
    expect(result.valid).toBe(false);
    expect(result.totalAccounts).toBe(2);
    expect(result.totalDifference).toBe(-50);
    expect(result.validations.find((v) => v.accountId === 'A1')?.valid).toBe(false);
    expect(result.validations.find((v) => v.accountId === 'A2')?.valid).toBe(true);
  });
});
