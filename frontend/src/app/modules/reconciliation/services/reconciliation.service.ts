import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../core/services/http-client.service';
import { Account, DashboardResult, IncidentResult } from '../../../core/models/index';

@Injectable({
  providedIn: 'root',
})
export class ReconciliationService {
  constructor(private readonly httpClient: HttpClientService) {}

  getDashboard(): Observable<DashboardResult> {
    return this.httpClient.get<DashboardResult>('/reconciliation/dashboard');
  }

  searchAccounts(query: string): Observable<Account[]> {
    return this.httpClient.get<Account[]>(`/reconciliation/accounts/search?q=${encodeURIComponent(query)}`);
  }

  getAccountDetail(accountId: string): Observable<Account> {
    return this.httpClient.get<Account>(`/reconciliation/accounts/${encodeURIComponent(accountId)}`);
  }

  getIncidents(reconciliationId?: string): Observable<IncidentResult[]> {
    const query = reconciliationId ? `?reconciliationId=${encodeURIComponent(reconciliationId)}` : '';
    return this.httpClient.get<IncidentResult[]>(`/reconciliation/incidents${query}`);
  }
}
