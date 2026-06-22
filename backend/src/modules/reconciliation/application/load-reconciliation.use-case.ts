import { Injectable, Inject } from '@nestjs/common';
import { IReconciliationRepository } from '../domain/reconciliation.repository.interface';
import { LoggerService } from '../../../common/logger/logger.service';
import { SchemaValidatorService } from '../infrastructure/schema-validator.service';
import { RECONCILIATION_SCHEMA } from '../domain/schemas/reconciliation.schema';
import { AuditUseCase } from '../../auth/application/audit.use-case';

@Injectable()
export class LoadReconciliationUseCase {
  constructor(
    @Inject('IReconciliationRepository')
    private readonly reconciliationRepository: IReconciliationRepository,
    private readonly schemaValidator: SchemaValidatorService,
    private readonly logger: LoggerService,
    private readonly auditUseCase: AuditUseCase,
  ) {}

  /**
   * Ejecuta el proceso de carga, validación y auditoría de una conciliación.
   */
  async execute(data: any, userId: string, correlationId: string): Promise<any> {
    this.logger.log('Iniciando validación de LoadReconciliationUseCase', correlationId);

    // 1. Validación Estructural
    this.schemaValidator.validate(RECONCILIATION_SCHEMA, data, correlationId);

    this.logger.log('Validación de esquema JSON exitosa', correlationId);

    // 2. Persistencia
    const result = await this.reconciliationRepository.save(data);

    this.logger.log(`Conciliación de fuente "${data.source}" cargada con éxito`, correlationId);
    
    // 3. Registro de Auditoría
    await this.auditUseCase.execute(
      userId,
      'RECONCILIATION_LOADED',
      { 
        source: data.source || 'unknown', 
        accountsCount: data.accounts?.length || 0,
        resultId: result?.id 
      },
      correlationId
    );

    return result;
  }
}