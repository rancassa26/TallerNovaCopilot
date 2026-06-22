import { Module } from '@nestjs/common';
import { ReconciliationController } from './presentation/reconciliation.controller';
import { LoadReconciliationUseCase } from './application/load-reconciliation.use-case';
import { SchemaValidatorService } from './infrastructure/schema-validator.service';
import { AuthModule } from '../auth/auth.module';
import { LoggerModule } from '../../common/logger/logger.module';

@Module({
  imports: [
    AuthModule,    // Para acceder al AuditUseCase
    LoggerModule,  // Para el LoggerService global
  ],
  controllers: [ReconciliationController],
  providers: [
    LoadReconciliationUseCase,
    SchemaValidatorService,
    {
      provide: 'IReconciliationRepository',
      // Placeholder: Aquí se inyectaría la implementación real (TypeORM/Mongoose)
      useClass: class { 
        async save(data: any) { 
          return { id: Date.now().toString(), ...data }; 
        } 
      }
    }
  ],
  exports: [LoadReconciliationUseCase],
})
export class ReconciliationModule {}