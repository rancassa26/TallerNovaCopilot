import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LoggerService } from '../../../common/logger/logger.service';

/**
 * ResolveIncidentUseCase - Application layer
 * Handles the business logic for updating an incident status
 */
@Injectable()
export class ResolveIncidentUseCase {
  constructor(
    @Inject('IIncidentRepository') private readonly incidentRepository: any,
    private readonly logger: LoggerService,
  ) {}

  async execute(incidentId: string, status: string, correlationId: string): Promise<any> {
    this.logger.log(`Executing ResolveIncidentUseCase for ID: ${incidentId}`, correlationId);

    const incident = await this.incidentRepository.findById(incidentId);
    
    if (!incident) {
      this.logger.error(`Incident not found: ${incidentId}`, correlationId);
      throw new NotFoundException(`Incident with ID ${incidentId} not found`);
    }

    // Update business state
    incident.status = status;
    incident.updatedAt = new Date();
    incident.resolvedAt = status === 'RESOLVED' ? new Date() : null;

    return await this.incidentRepository.update(incident);
  }
}