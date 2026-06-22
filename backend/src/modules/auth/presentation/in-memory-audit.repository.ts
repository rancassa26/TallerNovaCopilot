import { Injectable } from '@nestjs/common';
import { AuditLog } from './audit-log.entity';
import { IAuditRepository, PaginatedAuditLogs } from './audit.repository.interface';

@Injectable()
export class InMemoryAuditRepository implements IAuditRepository {
  private readonly auditLogs: AuditLog[] = [];

  async save(auditLog: AuditLog): Promise<AuditLog> {
    this.auditLogs.push(auditLog);
    return auditLog;
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedAuditLogs> {
    const total = this.auditLogs.length;
    const items = [...this.auditLogs]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice((page - 1) * limit, page * limit);
    return { items, total };
  }

  async findByUserId(userId: string, page = 1, limit = 10): Promise<PaginatedAuditLogs> {
    const filtered = this.auditLogs.filter((log) => log.userId === userId);
    const total = filtered.length;
    const items = filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice((page - 1) * limit, page * limit);
    return { items, total };
  }

  async findByCorrelationId(correlationId: string, page = 1, limit = 10): Promise<PaginatedAuditLogs> {
    const filtered = this.auditLogs.filter((log) => log.correlationId === correlationId);
    const total = filtered.length;
    const items = filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice((page - 1) * limit, page * limit);
    return { items, total };
  }
}