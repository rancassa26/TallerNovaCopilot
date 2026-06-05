import { ExportService } from './export.service';
import { of } from 'rxjs';
import { HttpClientService } from '../../../core/services/http-client.service';
import { LoggerService } from '../../../core/services/logger.service';

class MockHttpClientService {
  get = jasmine.createSpy('get');
}

class MockLoggerService {
  log = jasmine.createSpy('log');
  error = jasmine.createSpy('error');
}

describe('ExportService', () => {
  let service: ExportService;
  let httpClient: MockHttpClientService;
  let logger: MockLoggerService;

  beforeEach(() => {
    httpClient = new MockHttpClientService();
    logger = new MockLoggerService();
    service = new ExportService(httpClient as any, logger as any);
  });

  it('should build the correct export query for reconciliationId and format', (done) => {
    const exportResult = { filename: 'reconciliation.json', format: 'json', content: '{}' };
    httpClient.get.and.returnValue(of(exportResult));

    service.exportResults('R1', 'csv').subscribe((result) => {
      expect(httpClient.get).toHaveBeenCalledWith('/reconciliation/export?reconciliationId=R1&format=csv');
      expect(result).toEqual(exportResult);
      done();
    });
  });

  it('should download the generated file through the browser link element', () => {
    const exportResult = { filename: 'reconciliation.csv', format: 'csv', content: 'id,name' };
    const link: any = {
      href: '',
      download: '',
      click: jasmine.createSpy('click'),
      style: {},
    };

    spyOn(document, 'createElement').and.returnValue(link);
    spyOn(document.body, 'appendChild');
    spyOn(document.body, 'removeChild');
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob-url');
    spyOn(window.URL, 'revokeObjectURL');

    service.downloadFile(exportResult);

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(link.click).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob-url');
  });
