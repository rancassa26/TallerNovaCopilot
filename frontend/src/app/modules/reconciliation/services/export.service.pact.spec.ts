import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Pact, Matchers } from '@pact-foundation/pact';
import { ExportService } from './export.service';
import { HttpClientService } from '../../../core/services/http-client.service';
import { LoggerService } from '../../../core/services/logger.service';
import { path } from 'path';

describe('ExportService Pact', () => {
  const provider = new Pact({
    consumer: 'TallerNova-Frontend',
    provider: 'TallerNova-Backend',
    port: 1234,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'info',
  });

  let service: ExportService;

  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        ExportService,
        {
          provide: HttpClientService,
          useValue: new HttpClientService(
            TestBed.inject(HttpClientModule) as any,
            { log: () => {}, error: () => {} } as any
          )
        },
        LoggerService
      ]
    });
    
    service = TestBed.inject(ExportService);
    // Override apiUrl to point to Pact mock server
    (service as any).httpClient.apiUrl = 'http://localhost:1234/api';
  });

  describe('exportResults()', () => {
    it('should receive a valid JSON export result', (done) => {
      const reconciliationId = 'REC-123';
      
      provider.addInteraction({
        state: 'reconciliation exists for id REC-123',
        uponReceiving: 'a request for JSON export',
        withRequest: {
          method: 'GET',
          path: '/api/reconciliation/export',
          query: {
            reconciliationId: reconciliationId,
            format: 'json'
          },
          headers: {
            'Accept': 'application/json',
            'X-Correlation-ID': Matchers.uuid()
          }
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            success: Matchers.like(true),
            message: Matchers.like('Export generated successfully'),
            data: {
              filename: Matchers.term({
                generate: 'reconciliation-REC-123-export.json',
                matcher: '^reconciliation-.*\\.json$'
              }),
              format: 'json',
              content: Matchers.somethingLike('{"id": "REC-123"}')
            },
            correlationId: Matchers.uuid()
          }
        }
      }).then(() => {
        service.exportResults(reconciliationId, 'json').subscribe({
          next: (response) => {
            expect(response.format).toBe('json');
            done();
          },
          error: (err) => done.fail(err)
        });
      });
    });
  });
});