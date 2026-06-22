import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../core/services/http-client.service';

/**
 * AuditLog - Interfaz que representa un registro de auditoría.
 * Coincide con la entidad AuditLog definida en el backend.
 */
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: Record<string, any>;
  correlationId: string;
}

export interface PaginatedAuditLogs {
  items: AuditLog[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private readonly endpoint = '/auth/audit';

  constructor(private readonly httpClient: HttpClientService) {}

  /**
   * Obtiene todos los logs de auditoría registrados en el sistema.
   */
  getAuditLogs(page = 1, limit = 10): Observable<PaginatedAuditLogs> {
    return this.httpClient.get<PaginatedAuditLogs>(`${this.endpoint}?page=${page}&limit=${limit}`);
  }

  /**
   * Obtiene los logs de auditoría filtrados por un usuario específico.
   */
  getAuditLogsByUser(userId: string, page = 1, limit = 10): Observable<PaginatedAuditLogs> {
    return this.httpClient.get<PaginatedAuditLogs>(`${this.endpoint}/user/${encodeURIComponent(userId)}?page=${page}&limit=${limit}`);
  }

  /**
   * Obtiene los logs asociados a un Correlation ID específico para trazabilidad técnica.
   */
  getAuditLogsByCorrelationId(correlationId: string, page = 1, limit = 10): Observable<PaginatedAuditLogs> {
    return this.httpClient.get<PaginatedAuditLogs>(`${this.endpoint}/correlation/${encodeURIComponent(correlationId)}?page=${page}&limit=${limit}`);
  }
}