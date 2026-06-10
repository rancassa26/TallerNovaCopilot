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

  getIncidents(reconciliationId?: string, status?: string): Observable<IncidentResult[]> {
    const params: string[] = [];
    if (reconciliationId) params.push(`reconciliationId=${encodeURIComponent(reconciliationId)}`);
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    
    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    return this.httpClient.get<IncidentResult[]>(`/reconciliation/incidents${queryString}`);
  }

  loadReconciliation(data: any): Observable<any> {
    return this.httpClient.post<any>('/reconciliation/load', data);
  }

  updateIncidentStatus(incidentId: string, status: string): Observable<any> {
    return this.httpClient.patch<any>(`/reconciliation/incidents/${encodeURIComponent(incidentId)}/status`, { status });
  }
}
