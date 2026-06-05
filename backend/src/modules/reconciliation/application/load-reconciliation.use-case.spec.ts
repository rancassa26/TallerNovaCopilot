import { LoadReconciliationUseCase } from './load-reconciliation.use-case';
import { InMemoryReconciliationRepository } from '../infrastructure/in-memory-reconciliation.repository';
import { LoadReconciliationInputDto } from './dto/load-reconciliation.input.dto';

describe('LoadReconciliationUseCase', () => {
  let useCase: LoadReconciliationUseCase;
  let repository: InMemoryReconciliationRepository;

  beforeEach(() => {
    repository = new InMemoryReconciliationRepository();
    useCase = new LoadReconciliationUseCase(repository);
  });

  it('should create and persist a reconciliation summary', async () => {
    const input: LoadReconciliationInputDto = {
      source: 'test-file.json',
      accounts: [
        {
          id: 'A1',
          name: 'Cash Account',
          ledgerBalance: 1000,
          systemBalance: 950,
          incidents: [
            {
              id: 'I1',
              type: 'Difference',
              description: 'Round-off mismatch',
              amount: 50,
            },
          ],
        },
      ],
    };

    const result = await useCase.execute(input, 'correlation-123');

    expect(result.reconciliationId).toBeDefined();
    expect(result.source).toBe('test-file.json');
    expect(result.totalAccounts).toBe(1);
    expect(result.totalIncidents).toBe(1);
    expect(result.totalDifference).toBe(-50);

    const loaded = await repository.findById(result.reconciliationId);
    expect(loaded).not.toBeNull();
    expect(loaded?.accounts[0].name).toBe('Cash Account');
  });
});
