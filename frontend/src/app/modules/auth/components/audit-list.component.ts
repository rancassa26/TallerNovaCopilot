import { Component, OnInit } from '@angular/core';
import { AuditService, AuditLog } from '../services/audit.service';
import { finalize } from 'rxjs/operators';
import { ToastService } from '../../../core/services/toast.service';

/**
 * AuditLogUI - Interfaz extendida para manejar el estado de la vista.
 */
interface AuditLogUI extends AuditLog {
  showDetails?: boolean;
}

@Component({
  selector: 'app-audit-list',
  templateUrl: './audit-list.component.html',
  styleUrls: ['./audit-list.component.scss']
})
export class AuditListComponent implements OnInit {
  logs: AuditLogUI[] = [];
  loading = false;
  error = '';

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  
  userIdFilter = '';
  correlationIdFilter = '';

  constructor(
    private readonly auditService: AuditService,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.fetchLogs();
  }

  /**
   * fetchLogs - Método unificado para cargar datos respetando paginación y filtros.
   */
  fetchLogs(): void {
    this.loading = true;
    this.error = '';

    const userId = this.userIdFilter.trim();
    const correlationId = this.correlationIdFilter.trim();

    const request$ = userId
      ? this.auditService.getAuditLogsByUser(userId, this.currentPage, this.pageSize)
      : correlationId
      ? this.auditService.getAuditLogsByCorrelationId(correlationId, this.currentPage, this.pageSize)
      : this.auditService.getAuditLogs(this.currentPage, this.pageSize);

    request$
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.logs = data.items;
          this.totalItems = data.total;
        },
        error: (err) => (this.error = err.message || 'Error al cargar los logs de auditoría'),
      });
  }

  filterByUserId(): void {
    this.currentPage = 1;
    this.correlationIdFilter = ''; // Limpiamos el otro filtro para evitar conflictos
    this.fetchLogs();
  }

  filterByCorrelationId(): void {
    this.currentPage = 1;
    this.userIdFilter = ''; // Limpiamos el otro filtro para evitar conflictos
    this.fetchLogs();
  }

  /**
   * toggleDetails - Alterna la visualización de los detalles JSON del log.
   */
  toggleDetails(log: AuditLogUI): void {
    log.showDetails = !log.showDetails;
  }

  /**
   * copyToClipboard - Copia el objeto JSON al portapapeles.
   */
  copyToClipboard(json: any): void {
    const text = JSON.stringify(json, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      this.toastService.showSuccess('Detalles copiados al portapapeles');
    });
  }

  nextPage(): void {
    if ((this.currentPage * this.pageSize) < this.totalItems) {
      this.currentPage++;
      this.fetchLogs();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchLogs();
    }
  }
}