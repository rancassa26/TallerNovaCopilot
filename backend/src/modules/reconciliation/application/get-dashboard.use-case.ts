import { Injectable, Inject } from '@nestjs/common';
import { IReconciliationRepository } from '../domain/reconciliation.repository.interface';

/**
 * GetDashboardUseCase - Capa de Aplicación
 * Calcula las métricas agregadas y obtiene los procesos recientes para el Dashboard.
 */
@Injectable()
export class GetDashboardUseCase {
  constructor(
    @Inject('IReconciliationRepository')
    private readonly reconciliationRepository: IReconciliationRepository,
  ) {}

  async execute(): Promise<any> {
    const reconciliations = await this.reconciliationRepository.findAll();

    const totalReconciliations = reconciliations.length;
    let totalAccounts = 0;
    let totalIncidents = 0;
    let totalDifference = 0;
    const incidentsByType: Record<string, number> = {};

    // Procesamiento de KPIs globales y distribución por tipo
    reconciliations.forEach((rec) => {
      totalAccounts += rec.totalAccounts;
      totalIncidents += rec.totalIncidents;
      totalDifference += rec.totalDifference;

      rec.accounts.forEach((acc) => {
        acc.incidents.forEach((inc) => {
          incidentsByType[inc.type] = (incidentsByType[inc.type] || 0) + 1;
        });
      });
    });

    // Obtención de las últimas 5 conciliaciones (Sprint 3)
    const recentReconciliations = [...reconciliations]
      .sort((a, b) => b.loadedAt.getTime() - a.loadedAt.getTime())
      .slice(0, 5)
      .map((rec) => ({
        id: rec.id,
        source: rec.source,
        loadedAt: rec.loadedAt,
        totalDifference: rec.totalDifference,
      }));

    return {
      totalReconciliations,
      totalAccounts,
      totalIncidents,
      totalDifference,
      incidentsByType,
      recentReconciliations,
    };
  }
}