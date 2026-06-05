import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtGuard } from '../src/common/guards/jwt.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';

describe('Reconciliation API contract tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return dashboard contract shape', async () => {
    const response = await request(app.getHttpServer())
      .get('/reconciliation/dashboard')
      .expect(200);

    expect(response.body).toEqual(
      jasmine.objectContaining({
        message: jasmine.any(String),
        data: jasmine.any(Object),
        correlationId: jasmine.any(String),
        status: 200,
      }),
    );

    expect(response.body.data).toEqual(
      jasmine.objectContaining({
        totalReconciliations: jasmine.any(Number),
        totalAccounts: jasmine.any(Number),
        totalIncidents: jasmine.any(Number),
        totalDifference: jasmine.any(Number),
      }),
    );
  });
});
