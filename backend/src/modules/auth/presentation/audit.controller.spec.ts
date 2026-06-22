import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from './audit.controller';
import { AuditUseCase } from './audit.use-case';
import { Reflector } from '@nestjs/core';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';

describe('AuditController', () => {
  let controller: AuditController;
  let auditUseCase: any;
  let reflector: Reflector;

  beforeEach(async () => {
    auditUseCase = {
      findAll: jest.fn(),
      findByUserId: jest.fn(),
      findByCorrelationId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        {
          provide: AuditUseCase,
          useValue: auditUseCase,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<AuditController>(AuditController);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Security and Role Protection', () => {
    it('should have JwtGuard and RolesGuard applied at controller level', () => {
      const guards = Reflect.getMetadata('__guards__', AuditController);
      expect(guards).toContain(JwtGuard);
      expect(guards).toContain(RolesGuard);
    });

    it('findAll endpoint should be restricted to ADMIN role', () => {
      const roles = reflector.get<string[]>('roles', controller.findAll);
      expect(roles).toContain('ADMIN');
    });

    it('findByUserId endpoint should be restricted to ADMIN role', () => {
      const roles = reflector.get<string[]>('roles', controller.findByUserId);
      expect(roles).toContain('ADMIN');
    });

    it('findByCorrelationId endpoint should be restricted to ADMIN role', () => {
      const roles = reflector.get<string[]>('roles', controller.findByCorrelationId);
      expect(roles).toContain('ADMIN');
    });
  });

  describe('Endpoint Logic', () => {
    it('findAll should return all logs from use case', async () => {
      const mockLogs = { items: [{ id: '1', action: 'LOGIN' }], total: 1 } as any;
      auditUseCase.findAll.mockResolvedValue(mockLogs);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(auditUseCase.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockLogs);
    });

    it('findByUserId should call use case with correct userId', async () => {
      const userId = 'user-123';
      const mockLogs = { items: [], total: 0 };
      auditUseCase.findByUserId.mockResolvedValue(mockLogs);

      await controller.findByUserId(userId, { page: 1, limit: 10 });

      expect(auditUseCase.findByUserId).toHaveBeenCalledWith(userId, 1, 10);
    });

    it('findByCorrelationId should call use case with correct correlationId', async () => {
      const correlationId = 'corr-abc';
      const mockLogs = { items: [], total: 0 };
      auditUseCase.findByCorrelationId.mockResolvedValue(mockLogs);

      await controller.findByCorrelationId(correlationId, { page: 1, limit: 10 });

      expect(auditUseCase.findByCorrelationId).toHaveBeenCalledWith(correlationId, 1, 10);
    });
  });
});