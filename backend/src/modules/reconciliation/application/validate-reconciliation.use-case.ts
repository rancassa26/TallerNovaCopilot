import { Injectable, Inject } from '@nestjs/common';
import { NotFoundException } from '../../../common/exceptions/base.exception';
import { IReconciliationRepository } from '../domain/reconciliation.repository.interface';

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
  ) {}

  async execute(reconciliationId: string, correlationId: string): Promise<ValidateReconciliationResult> {
    const reconciliation = await this.reconciliationRepository.findById(reconciliationId);

    if (!reconciliation) {
      throw new NotFoundException(`Reconciliation ${reconciliationId} not found`, correlationId);
    }

    const validations = reconciliation.accounts.map((account) => {
      const difference = account.difference;
      const issues: string[] = [];

      if (difference !== 0) {
        issues.push('Balance mismatch');
      }

      const negativeIncidents = account.incidents.filter((incident) => incident.amount < 0);
      if (negativeIncidents.length > 0) {
        issues.push('Negative incident amount');
      }

      return {
        accountId: account.id,
        accountName: account.name,
        difference,
        valid: issues.length === 0,
        issues,
      };
    });

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
