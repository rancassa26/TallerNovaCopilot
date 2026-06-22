import { ExportResultsUseCase } from './export-results.use-case';
import { InMemoryReconciliationRepository } from '../infrastructure/in-memory-reconciliation.repository';
import { Reconciliation } from '../domain/reconciliation.entity';
import { Account, AccountIncident } from '../domain/account.entity';
import { AuditUseCase } from '../../auth/presentation/audit.use-case';

describe('ExportResultsUseCase', () => {
  let repository: InMemoryReconciliationRepository;
  let useCase: ExportResultsUseCase;
  let auditUseCase: any;

  beforeEach(() => {
    repository = new InMemoryReconciliationRepository();
    auditUseCase = {
      execute: jest.fn(),
    };
    useCase = new ExportResultsUseCase(repository, auditUseCase);
  });

  it('should export reconciliation data in JSON format and register audit', async () => {
    const reconciliation = new Reconciliation('R1', 'file.json', new Date('2026-06-03T12:00:00Z'), [
      new Account('A1', 'Cash', 1000, 1000, [new AccountIncident('I1', 'A1', 'Difference', 'No gap', 0)]),
    ]);
    await repository.create(reconciliation);

    const result = await useCase.execute('R1', 'json', 'user-1', 'corr-123');

    expect(result.filename).toBe('reconciliation-R1-export.json');
    expect(result.format).toBe('json');
    expect(result.content).toContain('"id": "R1"');
    expect(result.content).toContain('"source": "file.json"');
    expect(auditUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      'RECONCILIATION_EXPORTED',
      expect.objectContaining({ reconciliationId: 'R1', format: 'json' }),
      'corr-123'
    );
  });

  it('should export reconciliation data in CSV format and register audit', async () => {
    const reconciliation = new Reconciliation('R2', 'file2.json', new Date('2026-06-03T12:00:00Z'), [
      new Account('A2', 'Bank', 2000, 2050, [new AccountIncident('I2', 'A2', 'Adjustment', 'Interest', 50)]),
    ]);
    await repository.create(reconciliation);

    const result = await useCase.execute('R2', 'csv', 'user-2', 'corr-456');

    expect(result.filename).toBe('reconciliation-R2-export.csv');
    expect(result.format).toBe('csv');
    expect(result.content).toContain('reconciliationId,source,loadedAt,accountId,accountName,ledgerBalance,systemBalance,difference,incidentCount,incidentId,incidentType,incidentDescription,incidentAmount');
    expect(result.content).toContain('R2,file2.json');
    expect(result.content).toContain('I2,Adjustment,Interest,50');
    expect(auditUseCase.execute).toHaveBeenCalledWith(
      'user-2',
      'RECONCILIATION_EXPORTED',
      expect.objectContaining({ reconciliationId: 'R2', format: 'csv' }),
      'corr-456'
    );
  });
});
