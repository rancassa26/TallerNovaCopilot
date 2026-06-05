import { ExportResultsUseCase } from './export-results.use-case';
import { InMemoryReconciliationRepository } from '../infrastructure/in-memory-reconciliation.repository';
import { Reconciliation } from '../domain/reconciliation.entity';
import { Account, AccountIncident } from '../domain/account.entity';

describe('ExportResultsUseCase', () => {
  let repository: InMemoryReconciliationRepository;
  let useCase: ExportResultsUseCase;

  beforeEach(() => {
    repository = new InMemoryReconciliationRepository();
    useCase = new ExportResultsUseCase(repository);
  });

  it('should export reconciliation data in JSON format', async () => {
    const reconciliation = new Reconciliation('R1', 'file.json', new Date('2026-06-03T12:00:00Z'), [
      new Account('A1', 'Cash', 1000, 1000, [new AccountIncident('I1', 'A1', 'Difference', 'No gap', 0)]),
    ]);
    await repository.create(reconciliation);

    const result = await useCase.execute('R1', 'json', 'corr-123');

    expect(result.filename).toBe('reconciliation-R1-export.json');
    expect(result.format).toBe('json');
    expect(result.content).toContain('"id": "R1"');
    expect(result.content).toContain('"source": "file.json"');
  });

  it('should export reconciliation data in CSV format', async () => {
    const reconciliation = new Reconciliation('R2', 'file2.json', new Date('2026-06-03T12:00:00Z'), [
      new Account('A2', 'Bank', 2000, 2050, [new AccountIncident('I2', 'A2', 'Adjustment', 'Interest', 50)]),
    ]);
    await repository.create(reconciliation);

    const result = await useCase.execute('R2', 'csv', 'corr-456');

    expect(result.filename).toBe('reconciliation-R2-export.csv');
    expect(result.format).toBe('csv');
    expect(result.content).toContain('reconciliationId,source,loadedAt,accountId,accountName,ledgerBalance,systemBalance,difference,incidentCount,incidentId,incidentType,incidentDescription,incidentAmount');
    expect(result.content).toContain('R2,file2.json');
    expect(result.content).toContain('I2,Adjustment,Interest,50');
  });
});
