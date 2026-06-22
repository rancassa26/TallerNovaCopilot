import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClientService } from '../../../core/services/http-client.service';
import { Account, DashboardResult, IncidentResult, ValidateReconciliationResult } from '../../../core/models/index';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../../core/services/toast.service';
import { ReconciliationValidationModalComponent } from '../components/reconciliation-validation-modal/reconciliation-validation-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ReconciliationService {
  constructor(
    private readonly httpClient: HttpClientService,
    private readonly toastService: ToastService,
    private readonly dialog: MatDialog // Inyectamos MatDialog
  ) {}

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

  /**
   * Ejecuta el proceso de validación de una conciliación y notifica los resultados.
   * @param reconciliationId ID de la conciliación a validar.
   */
  validateReconciliation(reconciliationId: string): Observable<ValidateReconciliationResult> {
    return this.httpClient.post<ValidateReconciliationResult>('/reconciliation/validate', { reconciliationId }).pipe(
      tap((result) => {
        if (result.valid) {
          this.toastService.showSuccess('La conciliación es válida: No se detectaron discrepancias de saldo.');
        } else {
          const issuesCount = result.validations.filter(v => !v.valid).length;
          this.toastService.showError(
            `Validación finalizada con alertas: Se encontraron discrepancias en ${issuesCount} cuentas.`
          );
          // Abrir el modal con los detalles de la validación
          this.dialog.open(ReconciliationValidationModalComponent, {
            width: '800px', // Ancho del modal
            data: result // Pasamos el resultado completo al modal
          });
        }
      })
    );
  }

  updateIncidentStatus(incidentId: string, status: string): Observable<any> {
    return this.httpClient.patch<any>(`/reconciliation/incidents/${encodeURIComponent(incidentId)}/status`, { status });
  }
}
