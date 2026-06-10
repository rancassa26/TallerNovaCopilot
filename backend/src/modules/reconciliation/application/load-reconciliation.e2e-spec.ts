import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtGuard } from '../src/common/guards/jwt.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { RECONCILIATION_SCHEMA } from '../src/modules/reconciliation/domain/schemas/reconciliation.schema';
import { SchemaValidatorService } from '../src/modules/reconciliation/infrastructure/schema-validator.service';

describe('LoadReconciliation (e2e)', () => {
  let app: INestApplication;
  let schemaValidatorService: SchemaValidatorService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true }) // Bypass JWT authentication
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true }) // Bypass Role authorization
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhiteListed: true,
        transform: true,
      }),
    );
    await app.init();

    schemaValidatorService = app.get<SchemaValidatorService>(SchemaValidatorService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/reconciliation/load (POST) - should successfully load a valid reconciliation JSON', async () => {
    const validReconciliationData = {
      source: 'test-upload.json',
      accounts: [
        {
          id: 'ACC-001',
          name: 'Checking Account',
          ledgerBalance: 1000.00,
          systemBalance: 950.00,
          incidents: [
            {
              id: 'INC-001',
              type: 'DIFFERENCE',
              description: 'Missing transaction',
              amount: 50.00,
            },
          ],
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .post('/api/reconciliation/load')
      .send(validReconciliationData)
      .set('X-Correlation-Id', 'test-corr-id-1')
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Reconciliation loaded successfully',
        status: 201,
        correlationId: 'test-corr-id-1',
        data: expect.objectContaining({
          id: expect.any(String),
          source: 'test-upload.json',
          totalAccounts: 1,
          totalIncidents: 1,
        }),
      }),
    );
  });

  it('/reconciliation/load (POST) - should return 400 for invalid reconciliation JSON (schema violation)', async () => {
    const invalidReconciliationData = {
      source: 'invalid-upload.json',
      accounts: [
        {
          id: 'ACC-002',
          name: 'Savings Account',
          ledgerBalance: 'not-a-number', // Invalid type
          systemBalance: 200.00,
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .post('/api/reconciliation/load')
      .send(invalidReconciliationData)
      .set('X-Correlation-Id', 'test-corr-id-2')
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: expect.stringContaining('JSON Schema validation failed'),
        status: 400,
        correlationId: 'test-corr-id-2',
      }),
    );
  });
});