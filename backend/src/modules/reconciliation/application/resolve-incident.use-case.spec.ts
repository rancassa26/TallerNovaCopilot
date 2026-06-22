import { Test, TestingModule } from '@nestjs/testing';
import { ResolveIncidentUseCase } from './resolve-incident.use-case';
import { AuditUseCase } from '../../auth/presentation/audit.use-case';
import { LoggerService } from '../../../common/logger/logger.service';
import { NotFoundException } from '@nestjs/common';

describe('ResolveIncidentUseCase', () => {
  let useCase: ResolveIncidentUseCase;
  let repository: any;
  let auditUseCase: any;
  let logger: any;

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    auditUseCase = {
      execute: jest.fn(),
    };
    logger = {
      log: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResolveIncidentUseCase,
        {
          provide: 'IIncidentRepository',
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

    useCase = module.get<ResolveIncidentUseCase>(ResolveIncidentUseCase);
  });

  it('should update incident status and call auditUseCase', async () => {
    const incidentId = 'INC-123';
    const status = 'RESOLVED';
    const userId = 'user-456';
    const correlationId = 'corr-789';
    const mockIncident = { id: incidentId, status: 'PENDING' };

    repository.findById.mockResolvedValue(mockIncident);
    repository.update.mockResolvedValue({ ...mockIncident, status });

    const result = await useCase.execute(incidentId, status, userId, correlationId);

    expect(repository.findById).toHaveBeenCalledWith(incidentId);
    expect(repository.update).toHaveBeenCalled();
    expect(result.status).toBe(status);
    expect(auditUseCase.execute).toHaveBeenCalledWith(
      userId,
      'INCIDENT_STATUS_UPDATED',
      { incidentId, previousStatus: 'PENDING', newStatus: status },
      correlationId,
    );
  });

  it('should throw NotFoundException and not call audit if incident does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('none', 'RESOLVED', 'user-1', 'corr-1'),
    ).rejects.toThrow(NotFoundException);

    expect(auditUseCase.execute).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });
});