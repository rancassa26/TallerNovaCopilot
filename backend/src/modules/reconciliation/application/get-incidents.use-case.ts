import { Injectable, Inject } from '@nestjs/common';
import { NotFoundException } from '../../../common/exceptions/base.exception';
import { IReconciliationRepository } from '../domain/reconciliation.repository.interface';

export interface IncidentResult {
  reconciliationId: string;
  accountId: string;
  accountName: string;
  incidentId: string;
  type: string;
  description: string;
  amount: number;
}

@Injectable()
export class GetIncidentsUseCase {
  constructor(
    @Inject('IReconciliationRepository')
    private readonly reconciliationRepository: IReconciliationRepository,
  ) {}

  async execute(reconciliationId?: string): Promise<IncidentResult[]> {
    let accounts = await this.reconciliationRepository.listAllAccounts();
    let resolvedReconciliationId = 'all';

    if (reconciliationId) {
      const reconciliation = await this.reconciliationRepository.findById(reconciliationId);
      if (!reconciliation) {
        throw new NotFoundException(`Reconciliation ${reconciliationId} not found`, reconciliationId);
      }
      accounts = reconciliation.accounts;
      resolvedReconciliationId = reconciliationId;
    }

    const incidents: IncidentResult[] = [];

    for (const account of accounts) {
      for (const incident of account.incidents) {
        incidents.push({
          reconciliationId: resolvedReconciliationId,
          accountId: account.id,
          accountName: account.name,
          incidentId: incident.id,
          type: incident.type,
          description: incident.description,
          amount: incident.amount,
        });
      }
    }

    return incidents;
  }
}
