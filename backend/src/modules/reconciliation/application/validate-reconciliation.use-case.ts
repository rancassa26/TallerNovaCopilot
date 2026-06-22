import { Injectable, Inject } from '@nestjs/common';
import { NotFoundException } from '../../../common/exceptions/base.exception';
import { IReconciliationRepository } from '../domain/reconciliation.repository.interface';
import { AuditUseCase } from '../../auth/application/audit.use-case';
import { LoggerService } from '../../../common/logger/logger.service';

export interface AccountValidationResult {
  accountId: string;
  accountName: string;
  difference: number;
  valid: boolean;
  issues: string[];
}

export interface ValidateReconciliationResult {
  reconciliationId: string;
  source: string;
  valid: boolean;
  totalAccounts: number;
  totalDifference: number;
  validations: AccountValidationResult[];
}

@Injectable()
export class ValidateReconciliationUseCase {
  constructor(
    @Inject('IReconciliationRepository')
    private readonly reconciliationRepository: IReconciliationRepository,
    private readonly auditUseCase: AuditUseCase,
    private readonly logger: LoggerService,
  ) {}

  async execute(reconciliationId: string, userId: string, correlationId: string): Promise<ValidateReconciliationResult> {
    this.logger.log(`Iniciando validación automática para conciliación: ${reconciliationId}`, correlationId);

    const reconciliation = await this.reconciliationRepository.findById(reconciliationId);

    if (!reconciliation) {
      throw new NotFoundException(`Reconciliation ${reconciliationId} not found`, correlationId);
    }

    let automaticIncidentsCount = 0;

    const validations = reconciliation.accounts.map((account) => {
      const difference = account.ledgerBalance - account.systemBalance;
      const issues: string[] = [];

      if (difference !== 0) {
        issues.push('Balance mismatch');
      }

      const negativeIncidents = account.incidents.filter((incident) => incident.amount < 0);
      if (negativeIncidents.length > 0) {
        issues.push('Negative incident amount');
      }

      // Lógica de generación automática de incidentes por diferencia de saldo
      if (difference !== 0) {
        const hasBalanceMismatch = account.incidents.some(inc => inc.type === 'BALANCE_MISMATCH');
        
        if (!hasBalanceMismatch) {
          account.incidents.push({
            id: `AUTO-${account.id}-${Date.now()}`,
            type: 'BALANCE_MISMATCH',
            description: `Incidente generado automáticamente: Diferencia de saldo de ${difference} detectada.`,
            amount: Math.abs(difference)
          });
          automaticIncidentsCount++;
        }
      }

      return {
        accountId: account.id,
        accountName: account.name,
        difference,
        valid: issues.length === 0,
        issues,
      };
    });

    // Persistimos los cambios (nuevos incidentes generados)
    await this.reconciliationRepository.save(reconciliation);

    // Registrar en auditoría la validación realizada
    await this.auditUseCase.execute(
      userId,
      'RECONCILIATION_VALIDATED',
      { reconciliationId, automaticIncidentsCount, totalIncidents: reconciliation.totalIncidents },
      correlationId
    );

    return {
      reconciliationId: reconciliation.id,
      source: reconciliation.source,
      valid: validations.every((validation) => validation.valid),
      totalAccounts: reconciliation.totalAccounts,
      totalDifference: reconciliation.totalDifference,
      validations,
    };
  }
}
