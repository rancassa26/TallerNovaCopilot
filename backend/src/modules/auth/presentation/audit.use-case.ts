import { Injectable, Inject } from '@nestjs/common';
import { AuditLog } from './audit-log.entity';
import { IAuditRepository, PaginatedAuditLogs } from './audit.repository.interface';
import { LoggerService } from '../../../common/logger/logger.service';

@Injectable()
export class AuditUseCase {
  constructor(
    @Inject('IAuditRepository') private readonly auditRepository: IAuditRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(
    userId: string,
    action: string,
    details: Record<string, any>,
    correlationId: string,
  ): Promise<AuditLog> {
    const auditLog = new AuditLog(userId, action, details, correlationId);
    await this.auditRepository.save(auditLog);
    this.logger.log(`Audit: User ${userId} performed action "${action}"`, correlationId, { auditLogId: auditLog.id });
    return auditLog;
  }

  async findAll(page?: number, limit?: number): Promise<PaginatedAuditLogs> {
    return this.auditRepository.findAll(page, limit);
  }

  async findByUserId(userId: string, page?: number, limit?: number): Promise<PaginatedAuditLogs> {
    return this.auditRepository.findByUserId(userId, page, limit);
  }

  async findByCorrelationId(correlationId: string, page?: number, limit?: number): Promise<PaginatedAuditLogs> {
    return this.auditRepository.findByCorrelationId(correlationId, page, limit);
  }
}