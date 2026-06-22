import { Test, TestingModule } from '@nestjs/testing';
import { ReconciliationController } from './reconciliation.controller';
import { LoadReconciliationUseCase } from '../application/load-reconciliation.use-case';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { UserRole } from '../../auth/domain/auth.enum';
import { BaseResponseDTO } from '../../../common/dtos/base-response.dto';

describe('ReconciliationController', () => {
  let controller: ReconciliationController;
  let loadUseCase: jest.Mocked<LoadReconciliationUseCase>;
  let reflector: Reflector;

  beforeEach(async () => {
    // Creamos un mock del caso de uso
    const mockLoadUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReconciliationController],
      providers: [
        {
          provide: LoadReconciliationUseCase,
          useValue: mockLoadUseCase,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<ReconciliationController>(ReconciliationController);
    loadUseCase = module.get(LoadReconciliationUseCase);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Security and Role Protection', () => {
    it('should have JwtAuthGuard and RolesGuard applied at controller level', () => {
      const guards = Reflect.getMetadata('__guards__', ReconciliationController);
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(RolesGuard);
    });

    it('load endpoint should be restricted to ADMIN role', () => {
      const roles = reflector.get<string[]>('roles', controller.load);
      expect(roles).toContain(UserRole.ADMIN);
    });
  });

  describe('load', () => {
    const mockData = { source: 'test-file.json', accounts: [] };
    const mockUser = { sub: 'user-id-123' };
    const mockCorrelationId = 'corr-uuid-456';
    const mockRequest = { user: mockUser };

    it('should call loadUseCase.execute and return a success BaseResponseDTO', async () => {
      const mockResult = { id: 'REC-001', ...mockData };
      loadUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.load(mockData, mockRequest, mockCorrelationId);

      // Validamos que se pase el ID de usuario extraído del request y los datos correctos
      expect(loadUseCase.execute).toHaveBeenCalledWith(mockData, mockUser.sub, mockCorrelationId);
      
      // Validamos la estructura de la respuesta estandarizada
      expect(result).toBeInstanceOf(BaseResponseDTO);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(result.correlationId).toBe(mockCorrelationId);
      expect(result.status).toBe(201);
    });

    it('should propagate exceptions thrown by the use case', async () => {
      const error = new Error('Persistence error');
      loadUseCase.execute.mockRejectedValue(error);

      await expect(controller.load(mockData, mockRequest, mockCorrelationId))
        .rejects.toThrow(error);
    });
  });
});