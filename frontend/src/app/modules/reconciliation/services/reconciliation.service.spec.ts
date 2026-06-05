import { ReconciliationService } from './reconciliation.service';

describe('ReconciliationService', () => {
  let service: ReconciliationService;
  let httpClient: any;

  beforeEach(() => {
    httpClient = {
      get: jest.fn(),
    };
    service = new ReconciliationService(httpClient);
  });

  it('should call dashboard endpoint', () => {
    httpClient.get.mockReturnValue('dashboard-result');

    const result = service.getDashboard();

    expect(httpClient.get).toHaveBeenCalledWith('/reconciliation/dashboard');
    expect(result).toBe('dashboard-result');
  });

  it('should encode search query', () => {
    httpClient.get.mockReturnValue('accounts-result');

    const result = service.searchAccounts('cash account');

    expect(httpClient.get).toHaveBeenCalledWith('/reconciliation/accounts/search?q=cash%20account');
    expect(result).toBe('accounts-result');
  });

  it('should encode account id in detail URL', () => {
    httpClient.get.mockReturnValue('detail-result');

    const result = service.getAccountDetail('A1/2');

    expect(httpClient.get).toHaveBeenCalledWith('/reconciliation/accounts/A1%2F2');
    expect(result).toBe('detail-result');
  });

  it('should add query param for incidents when reconciliationId provided', () => {
    httpClient.get.mockReturnValue('incidents-result');

    const result = service.getIncidents('R1');

    expect(httpClient.get).toHaveBeenCalledWith('/reconciliation/incidents?reconciliationId=R1');
    expect(result).toBe('incidents-result');
  });

  it('should call incidents endpoint without query param when reconciliationId is not provided', () => {
    httpClient.get.mockReturnValue('incidents-result');

    const result = service.getIncidents();

    expect(httpClient.get).toHaveBeenCalledWith('/reconciliation/incidents');
    expect(result).toBe('incidents-result');
  });
});
