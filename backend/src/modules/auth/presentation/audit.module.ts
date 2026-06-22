import { Module } from '@nestjs/common';
import { AuditUseCase } from './audit.use-case';
import { AuditController } from './audit.controller';
import { InMemoryAuditRepository } from './in-memory-audit.repository';
import { LoggerService } from '../../../common/logger/logger.service';

@Module({
  controllers: [AuditController],
  providers: [
    AuditUseCase,
    LoggerService, // Asegurarse de que LoggerService esté disponible
    {
      provide: 'IAuditRepository',
      useClass: InMemoryAuditRepository,
    },
  ],
  exports: [
    AuditUseCase, // Exportar el caso de uso para que otros módulos puedan usarlo
    'IAuditRepository', // Exportar el token del repositorio si otros módulos necesitan interactuar directamente
  ],
})
export class AuditModule {}