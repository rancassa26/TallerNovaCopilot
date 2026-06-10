import { Module } from '@nestjs/common';
import { ReconciliationController } from './presentation/reconciliation.controller';
import { LoadReconciliationUseCase } from './application/load-reconciliation.use-case';
import { ValidateReconciliationUseCase } from './application/validate-reconciliation.use-case';
import { SearchAccountsUseCase } from './application/search-accounts.use-case';
import { GetAccountDetailUseCase } from './application/get-account-detail.use-case';
import { GetDashboardUseCase } from './application/get-dashboard.use-case';
import { GetIncidentsUseCase } from './application/get-incidents.use-case';
import { ExportResultsUseCase } from './application/export-results.use-case';
import { ResolveIncidentUseCase } from './application/resolve-incident.use-case';
import { SchemaValidatorService } from './infrastructure/schema-validator.service';
import { InMemoryReconciliationRepository } from './infrastructure/in-memory-reconciliation.repository';
import { LoggerService } from '../../common/logger/logger.service';

@Module({
  controllers: [ReconciliationController],
  providers: [
    // Application Layer - Use Cases
    LoadReconciliationUseCase,
    ValidateReconciliationUseCase,
    SearchAccountsUseCase,
    GetAccountDetailUseCase,
    GetDashboardUseCase,
    GetIncidentsUseCase,
    ExportResultsUseCase,
    ResolveIncidentUseCase,
    
    // Infrastructure Layer - Services
    SchemaValidatorService,
    LoggerService,
    
    // Infrastructure Layer - Repository Pattern mapping
    {
      provide: 'IReconciliationRepository',
      useClass: InMemoryReconciliationRepository,
    },
    {
      provide: 'IIncidentRepository',
      useClass: InMemoryReconciliationRepository,
    },
  ],
  exports: [
    LoadReconciliationUseCase,
    ValidateReconciliationUseCase,
    GetDashboardUseCase,
    ExportResultsUseCase,
  ],
})
export class ReconciliationModule {}