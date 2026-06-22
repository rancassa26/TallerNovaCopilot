import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LoggerService } from '../../../common/logger/logger.service';
import { AuditUseCase } from '../../auth/presentation/audit.use-case';

/**
 * ResolveIncidentUseCase - Application layer
 * Handles the business logic for updating an incident status
 */
@Injectable()
export class ResolveIncidentUseCase {
  constructor(
    @Inject('IIncidentRepository') private readonly incidentRepository: any,
    private readonly auditUseCase: AuditUseCase,
    private readonly logger: LoggerService,
  ) {}

  async execute(incidentId: string, status: string, userId: string, correlationId: string): Promise<any> {
    this.logger.log(`Executing ResolveIncidentUseCase for ID: ${incidentId} by User: ${userId}`, correlationId);

    const incident = await this.incidentRepository.findById(incidentId);
    
    if (!incident) {
      this.logger.error(`Incident not found: ${incidentId}`, correlationId);
      throw new NotFoundException(`Incident with ID ${incidentId} not found`);
    }

    const previousStatus = incident.status;

    // Update business state
    incident.status = status;
    incident.updatedAt = new Date();
    incident.resolvedAt = status === 'RESOLVED' ? new Date() : null;

    const result = await this.incidentRepository.update(incident);

    // Registrar auditoría del cambio de estado
    await this.auditUseCase.execute(
      userId,
      'INCIDENT_STATUS_UPDATED',
      { incidentId, previousStatus, newStatus: status },
      correlationId,
    );

    return result;
  }
}