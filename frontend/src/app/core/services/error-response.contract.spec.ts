import { Pact, Matchers } from '@pact-foundation/pact';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import * as path from 'path';

const { like, term } = Matchers;

describe('Error Response Contract', () => {
  // Configuración del Mock Provider de Pact
  const provider = new Pact({
    consumer: 'TallerNovaFrontend',
    provider: 'TallerNovaBackend',
    port: 1234,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2,
  });

  let httpClient: HttpClient;

  beforeAll(async () => {
    await provider.setup();
  });

  afterAll(async () => {
    await provider.finalize();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    httpClient = TestBed.inject(HttpClient);
  });

  describe('when a 403 Forbidden error occurs', () => {
    beforeEach(async () => {
      // Definición de la interacción esperada: El contrato exige que el error incluya correlationId
      await provider.addInteraction({
        state: 'user is authenticated but lacks admin permission',
        uponReceiving: 'a GET request to secure audit endpoint',
        withRequest: {
          method: 'GET',
          path: '/api/auth/audit',
          headers: {
            'X-Correlation-Id': like('550e8400-e29b-41d4-a716-446655440000'),
          },
        },
        willRespondWith: {
          status: 403,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            message: like('Forbidden resource'),
            status: 403,
            // Validamos que el backend devuelva el campo correlationId con formato UUID
            correlationId: term({
              generate: '550e8400-e29b-41d4-a716-446655440000',
              matcher: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            }),
          },
        },
      });
    });

    it('should return a 403 error with a correlationId in the body', (done) => {
      const headers = new HttpHeaders().set('X-Correlation-Id', '550e8400-e29b-41d4-a716-446655440000');
      
      httpClient.get('http://localhost:1234/api/auth/audit', { headers }).subscribe({
        next: () => {
          done.fail('Expected a 403 error but received a success response');
        },
        error: (error) => {
          expect(error.status).toBe(403);
          // Verificamos que el cuerpo del error contenga el correlationId para asegurar trazabilidad técnica
          expect(error.error.correlationId).toBeDefined();
          expect(error.error.correlationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
          done();
        },
      });
    });

    afterEach(async () => {
      await provider.verify();
    });
  });
});