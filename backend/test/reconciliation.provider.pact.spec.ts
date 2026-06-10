import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Verifier } from '@pact-foundation/pact';
import { ReconciliationModule } from '../src/modules/reconciliation/reconciliation.module';
import { ExportResultsUseCase } from '../src/modules/reconciliation/application/export-results.use-case';
import { path } from 'path';

describe('Reconciliation Provider Pact Verification', () => {
  let app: INestApplication;
  let exportUseCase: ExportResultsUseCase;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ReconciliationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    await app.listen(3000);
    
    exportUseCase = moduleFixture.get<ExportResultsUseCase>(ExportResultsUseCase);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should verify the contracts from the frontend', async () => {
    const verifier = new Verifier({
      provider: 'TallerNova-Backend',
      providerBaseUrl: 'http://localhost:3000',
      pactUrls: [path.resolve(process.cwd(), '../pacts/tallernova-frontend-tallernova-backend.json')],
      stateHandlers: {
        'reconciliation exists for id REC-123': async () => {
          // Mock logic to ensure the use case returns data for REC-123
          jest.spyOn(exportUseCase, 'execute').mockResolvedValue({
            filename: 'reconciliation-REC-123-export.json',
            format: 'json',
            content: '{"id": "REC-123"}',
            contentType: 'application/json'
          });
          return 'State updated';
        },
      },
    });

    await verifier.verifyProvider();
  }, 30000); // Pact verification can take time
});