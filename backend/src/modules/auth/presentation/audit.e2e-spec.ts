import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext, CanActivate } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../../src/app.module';
import { JwtGuard } from '../../../../src/common/guards/jwt.guard';
import { RolesGuard } from '../../../../src/common/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { AuditUseCase } from './audit.use-case';

let mockUser = { sub: 'viewer-test-id', email: 'viewer@example.com', roles: ['VIEWER'] };

class MockJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = mockUser;
    return true; // Permitir que el JWT pase, para que RolesGuard pueda verificar los roles
  }
}

// Mock RolesGuard para verificar los roles requeridos por el endpoint
class MockRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true; // No se especificaron roles, permitir acceso
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Usuario establecido por MockJwtGuard
    if (!user || !user.roles) {
      return false; // No hay usuario o roles, denegar acceso
    }
    const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role));
    return hasRequiredRole;
  }
}

describe('AuditController (e2e) - Role Protection', () => {
  let app: INestApplication;
  let auditUseCase: AuditUseCase;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtGuard)
      .useClass(MockJwtGuard) // Usar nuestro mock para JwtGuard
      .overrideGuard(RolesGuard)
      .useClass(MockRolesGuard) // Usar nuestro mock para RolesGuard
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    auditUseCase = app.get<AuditUseCase>(AuditUseCase);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/audit (GET) - should return 403 Forbidden for a VIEWER user', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auth/audit')
      .set('X-Correlation-Id', 'e2e-corr-audit-all')
      .expect(403);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Forbidden resource',
        status: 403,
        correlationId: 'e2e-corr-audit-all',
      }),
    );
  });

  it('/auth/audit/user/:userId (GET) - should return 403 Forbidden for a VIEWER user', async () => {
    const userId = 'some-user-id';
    const response = await request(app.getHttpServer())
      .get(`/api/auth/audit/user/${userId}`)
      .set('X-Correlation-Id', 'e2e-corr-audit-user')
      .expect(403);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Forbidden resource',
        status: 403,
        correlationId: 'e2e-corr-audit-user',
      }),
    );
  });

  it('/auth/audit/correlation/:correlationId (GET) - should return 403 Forbidden for a VIEWER user', async () => {
    const correlationId = 'some-correlation-id';
    const response = await request(app.getHttpServer())
      .get(`/api/auth/audit/correlation/${correlationId}`)
      .set('X-Correlation-Id', 'e2e-corr-audit-correlation')
      .expect(403);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Forbidden resource',
        status: 403,
        correlationId: 'e2e-corr-audit-correlation',
      }),
    );
  });

  describe('Admin Access - Success', () => {
    const adminId = 'admin-user-id';
    const correlationId = 'admin-corr-id';

    beforeEach(async () => {
      // Cambiamos el mock para que sea un ADMIN
      mockUser = { sub: adminId, email: 'admin@example.com', roles: ['ADMIN'] };
      
      // Sembramos datos de prueba directamente en el repositorio usando el UseCase
      await auditUseCase.execute(adminId, 'ADMIN_ACTION_TEST', { key: 'value' }, correlationId);
    });

    it('/auth/audit (GET) - should return 200 OK and all logs for ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/audit')
        .set('X-Correlation-Id', 'admin-get-all')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBeGreaterThanOrEqual(1);
      expect(response.body.data.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: adminId,
            action: 'ADMIN_ACTION_TEST',
            correlationId: correlationId
          })
        ])
      );
    });

    it('/auth/audit/user/:userId (GET) - should return 200 OK and filtered logs for ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/auth/audit/user/${adminId}`)
        .set('X-Correlation-Id', 'admin-get-user')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.every((log: any) => log.userId === adminId)).toBe(true);
      expect(response.body.data.items).toContainEqual(
        expect.objectContaining({
          action: 'ADMIN_ACTION_TEST',
          userId: adminId
        })
      );
    });

    it('/auth/audit/correlation/:correlationId (GET) - should return 200 OK and filtered logs for ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/auth/audit/correlation/${correlationId}`)
        .set('X-Correlation-Id', 'admin-get-corr')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.every((log: any) => log.correlationId === correlationId)).toBe(true);
      expect(response.body.data.items[0]).toEqual(
        expect.objectContaining({
          action: 'ADMIN_ACTION_TEST',
          correlationId: correlationId
        })
      );
    });
  });
});