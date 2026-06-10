import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../../../common/logger/logger.service';
import { SchemaValidatorService } from '../infrastructure/schema-validator.service';
import { RECONCILIATION_SCHEMA } from '../domain/schemas/reconciliation.schema';
import { IReconciliationRepository } from '../domain/reconciliation.repository.interface';

@Injectable()
export class LoadReconciliationUseCase {
  constructor(
    @Inject('IReconciliationRepository')
    private readonly reconciliationRepository: IReconciliationRepository,
    private readonly schemaValidator: SchemaValidatorService,
    private readonly logger: LoggerService,
  ) {}

  async execute(data: any, correlationId: string): Promise<any> {
    this.logger.log('Starting LoadReconciliationUseCase validation', correlationId);

    // 1. Validar integridad estructural con JSON Schema
    this.schemaValidator.validate(RECONCILIATION_SCHEMA, data, correlationId);

    this.logger.log('JSON Schema validation passed', correlationId);

    // 2. Lógica de persistencia (Simulada para este paso)
    // Aquí se transformaría el DTO a Entidad de Dominio y se guardaría
    const result = await this.reconciliationRepository.save(data);

    this.logger.log(`Reconciliation from ${data.source} loaded successfully`, correlationId);
    
    return result;
  }
}