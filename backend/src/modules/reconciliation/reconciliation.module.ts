import { Module } from '@nestjs/common';
import { LoadReconciliationUseCase } from './application/load-reconciliation.use-case';
import { ValidateReconciliationUseCase } from './application/validate-reconciliation.use-case';
import { SearchAccountsUseCase } from './application/search-accounts.use-case';
import { GetAccountDetailUseCase } from './application/get-account-detail.use-case';
import { GetDashboardUseCase } from './application/get-dashboard.use-case';
import { GetIncidentsUseCase } from './application/get-incidents.use-case';
import { ExportResultsUseCase } from './application/export-results.use-case';
import { ReconciliationController } from './presentation/reconciliation.controller';
import { InMemoryReconciliationRepository } from './infrastructure/in-memory-reconciliation.repository';

@Module({
  controllers: [ReconciliationController],
  providers: [
    LoadReconciliationUseCase,
    ValidateReconciliationUseCase,
    SearchAccountsUseCase,
    GetAccountDetailUseCase,
    GetDashboardUseCase,
    GetIncidentsUseCase,
    ExportResultsUseCase,
    InMemoryReconciliationRepository,
    {
      provide: 'IReconciliationRepository',
      useClass: InMemoryReconciliationRepository,
    },
  ],
})
export class ReconciliationModule {}
