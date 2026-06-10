import { Test, TestingModule } from '@nestjs/testing';
import { ExportResultsUseCase } from './export-results.use-case';

describe('ExportResultsUseCase', () => {
  let useCase: ExportResultsUseCase;
  let reconciliationRepository: any;

  beforeEach(async () => {
    reconciliationRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportResultsUseCase,
        {
          provide: 'IReconciliationRepository',
          useValue: reconciliationRepository,
        },
      ],
    }).compile();

    useCase = module.get<ExportResultsUseCase>(ExportResultsUseCase);
  });

  describe('CSV Generation', () => {
    it('should generate a valid CSV string with headers and data rows for a single reconciliation', async () => {
      // Arrange
      const mockReconciliation = {
        id: 'REC-001',
        source: 'Manual Upload',
        loadedAt: new Date('2023-11-15T08:30:00Z'),
        accounts: [
          {
            id: 'ACC-1',
            name: 'Savings A',
            ledgerBalance: 1200.5,
            systemBalance: 1100.0,
            difference: 100.5,
            incidents: [
              {
                id: 'INC-1',
                type: 'FEE',
                description: 'Service Fee',
                amount: 100.5,
              },
            ],
          },
        ],
      };

      reconciliationRepository.findById.mockResolvedValue(mockReconciliation);

      // Act
      const result = await useCase.execute('REC-001', 'csv', 'correlation-id-123');

      // Assert
      expect(result.format).toBe('csv');
      const lines = result.content.split('\n');

      expect(lines[0]).toBe(
        'reconciliationId,source,loadedAt,accountId,accountName,ledgerBalance,systemBalance,difference,incidentCount,incidentId,incidentType,incidentDescription,incidentAmount',
      );
      
      // Verificación de la fila de datos (ISO string para la fecha)
      const expectedRow = 'REC-001,Manual Upload,2023-11-15T08:30:00.000Z,ACC-1,Savings A,1200.5,1100,100.5,1,INC-1,FEE,Service Fee,100.5';
      expect(lines[1]).toBe(expectedRow);
    });

    it('should correctly handle accounts with no incidents in CSV output', async () => {
      // Arrange
      const mockReconciliation = {
        id: 'REC-002',
        source: 'Auto System',
        loadedAt: new Date('2023-11-15T12:00:00Z'),
        accounts: [
          {
            id: 'ACC-2',
            name: 'Main Account',
            ledgerBalance: 5000,
            systemBalance: 5000,
            difference: 0,
            incidents: [],
          },
        ],
      };

      reconciliationRepository.findById.mockResolvedValue(mockReconciliation);

      // Act
      const result = await useCase.execute('REC-002', 'csv', 'corr-id');

      // Assert
      const lines = result.content.split('\n');
      // Los últimos 4 campos (id, tipo, desc, monto del incidente) deben estar vacíos
      expect(lines[1]).toBe('REC-002,Auto System,2023-11-15T12:00:00.000Z,ACC-2,Main Account,5000,5000,0,0,,,');
    });

    it('should escape fields containing commas or double quotes in CSV', async () => {
      // Arrange
      const mockReconciliation = {
        id: 'REC-003',
        source: 'External, Provider', // Contiene coma
        loadedAt: new Date('2023-11-15T15:00:00Z'),
        accounts: [
          {
            id: 'ACC-3',
            name: 'Account "VIP"', // Contiene comillas
            ledgerBalance: 100,
            systemBalance: 100,
            difference: 0,
            incidents: [],
          },
        ],
      };

      reconciliationRepository.findById.mockResolvedValue(mockReconciliation);

      // Act
      const result = await useCase.execute('REC-003', 'csv', 'corr-id');

      // Assert
      const lines = result.content.split('\n');
      expect(lines[1]).toContain('"External, Provider"');
      expect(lines[1]).toContain('"Account ""VIP"""');
    });
  });
});