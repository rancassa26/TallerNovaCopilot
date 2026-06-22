import { Test, TestingModule } from '@nestjs/testing';
import { ValidateReconciliationUseCase } from './validate-reconciliation.use-case';
import { Reconciliation } from '../domain/reconciliation.entity';
import { Account } from '../domain/account.entity';
import { AuditUseCase } from '../../auth/application/audit.use-case';
import { LoggerService } from '../../../common/logger/logger.service';

describe('ValidateReconciliationUseCase', () => {
  let useCase: ValidateReconciliationUseCase;
  let repository: any;
  let auditUseCase: any;
  let logger: any;

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    auditUseCase = {
      execute: jest.fn(),
    };
    logger = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateReconciliationUseCase,
        {
          provide: 'IReconciliationRepository',
          useValue: repository,
        },
        {
          provide: AuditUseCase,
          useValue: auditUseCase,
        },
        {
          provide: LoggerService,
          useValue: logger,
        },
      ],
    }).compile();

    useCase = module.get<ValidateReconciliationUseCase>(ValidateReconciliationUseCase);
  });

  it('should generate an automatic incident when a balance mismatch is detected', async () => {
    const reconciliation = new Reconciliation('R1', 'test.json', new Date(), [
      new Account('A1', 'Cash', 1000, 950, []),
      new Account('A2', 'Bank', 2000, 2000, []),
    ]);
    const userId = 'user-123';
    const correlationId = 'corr-xyz';

    repository.findById.mockResolvedValue(reconciliation);
    repository.save.mockResolvedValue(reconciliation);

    const result = await useCase.execute('R1', userId, correlationId);

    expect(result.reconciliationId).toBe('R1');
    expect(result.valid).toBe(false);
    expect(result.totalAccounts).toBe(2);
    expect(result.totalDifference).toBe(-50); // Calculado por la entidad: 950 - 1000

    // Verificar creación de incidente automático
    const accountA1 = reconciliation.accounts.find(a => a.id === 'A1');
    expect(accountA1?.incidents.length).toBe(1);
    expect(accountA1?.incidents[0].type).toBe('BALANCE_MISMATCH');
    expect(accountA1?.incidents[0].amount).toBe(50);

    // Verificar llamadas a dependencias
    expect(repository.save).toHaveBeenCalledWith(reconciliation);
    expect(auditUseCase.execute).toHaveBeenCalledWith(
      userId,
      'RECONCILIATION_VALIDATED',
      expect.objectContaining({
        reconciliationId: 'R1',
        automaticIncidentsCount: 1
      }),
      correlationId
    );
    expect(logger.log).toHaveBeenCalled();
  });

  it('should not duplicate an automatic incident if BALANCE_MISMATCH already exists', async () => {
    const existingIncident = { id: 'I1', type: 'BALANCE_MISMATCH', amount: 50, description: '...' };
    const reconciliation = new Reconciliation('R1', 'test.json', new Date(), [
      new Account('A1', 'Cash', 1000, 950, [existingIncident as any]),
    ]);

    repository.findById.mockResolvedValue(reconciliation);

    await useCase.execute('R1', 'user-1', 'corr-1');

    const accountA1 = reconciliation.accounts.find(a => a.id === 'A1');
    expect(accountA1?.incidents.length).toBe(1); // No debe aumentar la cantidad
    expect(auditUseCase.execute).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ automaticIncidentsCount: 0 }),
      expect.anything()
    );
  });
});
