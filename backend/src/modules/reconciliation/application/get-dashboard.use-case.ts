import { Injectable, Inject } from '@nestjs/common';
import { IReconciliationRepository } from '../domain/reconciliation.repository.interface';

export interface DashboardResult {
  totalReconciliations: number;
  totalAccounts: number;
  totalIncidents: number;
  totalDifference: number;
}

@Injectable()
export class GetDashboardUseCase {
  constructor(
    @Inject('IReconciliationRepository')
    private readonly reconciliationRepository: IReconciliationRepository,
  ) {}

  async execute(): Promise<DashboardResult> {
    const reconciliations = await this.reconciliationRepository.findAll();
    const totalAccounts = reconciliations.reduce((count, reconciliation) => count + reconciliation.totalAccounts, 0);
    const totalDifference = reconciliations.reduce((sum, reconciliation) => sum + reconciliation.totalDifference, 0);
    const totalIncidents = reconciliations.reduce((sum, reconciliation) => sum + reconciliation.totalIncidents, 0);

    return {
      totalReconciliations: reconciliations.length,
      totalAccounts,
      totalIncidents,
      totalDifference,
    };
  }
}
