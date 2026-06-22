import { Injectable, Inject } from '@nestjs/common';
import { AuditLog } from '../presentation/audit-log.entity';
import { IAuditRepository, PaginatedAuditLogs } from '../presentation/audit.repository.interface';
import { LoggerService } from '../../../common/logger/logger.service';

/**
 * AuditUseCase - Capa de Aplicación
 * Coordina la lógica de negocio para el registro y consulta de auditoría.
 */
@Injectable()
export class AuditUseCase {
  constructor(
    @Inject('IAuditRepository')
    private readonly auditRepository: IAuditRepository,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Registra una nueva acción en el log de auditoría.
   * @param userId ID del usuario que realiza la acción.
   * @param action Descripción de la acción realizada.
   * @param details Metadatos adicionales en formato JSON.
   * @param correlationId ID de correlación para trazabilidad técnica.
   */
  async execute(
    userId: string,
    action: string,
    details: Record<string, any>,
    correlationId: string,
  ): Promise<AuditLog> {
    const auditLog = new AuditLog(userId, action, details, correlationId);
    
    await this.auditRepository.save(auditLog);
    
    this.logger.log(
      `Audit: User ${userId} performed action "${action}"`,
      correlationId,
      { auditLogId: auditLog.id }
    );
    
    return auditLog;
  }

  /**
   * Recupera todos los logs de auditoría con soporte de paginación.
   */
  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedAuditLogs> {
    return this.auditRepository.findAll(page, limit);
  }

  /**
   * Recupera logs filtrados por usuario.
   */
  async findByUser(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedAuditLogs> {
    return this.auditRepository.findByUserId(userId, page, limit);
  }

  /**
   * Recupera logs filtrados por ID de correlación para debugging técnico.
   */
  async findByCorrelationId(correlationId: string, page: number = 1, limit: number = 10): Promise<PaginatedAuditLogs> {
    return this.auditRepository.findByCorrelationId(correlationId, page, limit);
  }
}