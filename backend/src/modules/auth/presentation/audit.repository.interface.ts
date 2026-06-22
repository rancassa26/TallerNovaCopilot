import { AuditLog } from './audit-log.entity';

export interface PaginatedAuditLogs {
  items: AuditLog[];
  total: number;
}

export interface IAuditRepository {
  save(auditLog: AuditLog): Promise<AuditLog>;
  findAll(page?: number, limit?: number): Promise<PaginatedAuditLogs>;
  findByUserId(userId: string, page?: number, limit?: number): Promise<PaginatedAuditLogs>;
  findByCorrelationId(correlationId: string, page?: number, limit?: number): Promise<PaginatedAuditLogs>;
}