import { Test, TestingModule } from '@nestjs/testing';
import { LoadReconciliationUseCase } from './load-reconciliation.use-case';
import { SchemaValidatorService } from '../infrastructure/schema-validator.service';
import { LoggerService } from '../../../common/logger/logger.service';
import { RECONCILIATION_SCHEMA } from '../domain/schemas/reconciliation.schema';
import { LoadReconciliationInputDto } from './dto/load-reconciliation.input.dto';
import { ValidationException } from '../../../common/exceptions/base.exception';
import { AuditUseCase } from '../../auth/presentation/audit.use-case';

describe('LoadReconciliationUseCase', () => {
  let useCase: LoadReconciliationUseCase;
  let repository: any;
  let schemaValidator: any;
  let logger: any;
  let auditUseCase: any;

  beforeEach(async () => {
    repository = {
      save: jest.fn(),
    };
    schemaValidator = {
      validate: jest.fn(),
    };
    logger = {
      log: jest.fn(),
      error: jest.fn(),
    };
    auditUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadReconciliationUseCase,
        {
          provide: 'IReconciliationRepository',
          useValue: repository,
        },
        {
          provide: SchemaValidatorService,
          useValue: schemaValidator,
        },
        {
          provide: LoggerService,
          useValue: logger,
        },
        {
          provide: AuditUseCase,
          useValue: auditUseCase,
        },
      ],
    }).compile();

    useCase = module.get<LoadReconciliationUseCase>(LoadReconciliationUseCase);
  });

  it('should validate the input against schema, persist data and call auditUseCase', async () => {
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
    const correlationId = 'corr-123';
    const userId = 'user-test-id';
    const mockResult = { reconciliationId: 'REC-001', ...input };
    repository.save.mockResolvedValue(mockResult);

    const result = await useCase.execute(input, userId, correlationId);

    expect(schemaValidator.validate).toHaveBeenCalledWith(RECONCILIATION_SCHEMA, input, correlationId);
    expect(repository.save).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockResult);
    expect(logger.log).toHaveBeenCalled();
    expect(auditUseCase.execute).toHaveBeenCalledWith(
      userId,
      'RECONCILIATION_LOADED',
      { source: input.source, accountsCount: input.accounts.length },
      correlationId
    );
  });

  it('should throw ValidationException and not persist or audit if schema validation fails', async () => {
    const invalidData = { source: '' };
    const correlationId = 'corr-err';
    const userId = 'user-err';
    schemaValidator.validate.mockImplementation(() => {
      throw new ValidationException('Invalid schema', correlationId);
    });

    await expect(useCase.execute(invalidData, userId, correlationId)).rejects.toThrow(ValidationException);
    expect(repository.save).not.toHaveBeenCalled();
    expect(auditUseCase.execute).not.toHaveBeenCalled();
  });
});
