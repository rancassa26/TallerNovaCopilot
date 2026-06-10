import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../../../common/logger/logger.service';

/**
 * ExportResultsUseCase - Capa de Aplicación
 * Maneja la generación de archivos de exportación (JSON/CSV) para auditoría.
 */
@Injectable()
export class ExportResultsUseCase {
  constructor(
    @Inject('IIncidentRepository') private readonly incidentRepository: any,
    private readonly logger: LoggerService,
  ) {}

  async execute(reconciliationId: string | null, format: string, correlationId: string): Promise<any> {
    this.logger.log(`Iniciando exportación ${format.toUpperCase()} para: ${reconciliationId || 'TODAS'}`, correlationId);

    // 1. Recuperación de datos (Incidentes/Partidas)
    // Se asume que el repositorio implementa un método de búsqueda con filtros básicos
    const incidents = await this.incidentRepository.find({
      where: reconciliationId ? { reconciliationId } : {},
    });

    const timestamp = new Date().getTime();
    const filename = `export_${reconciliationId || 'consolidado'}_${timestamp}.${format}`;

    let content: string;
    let contentType: string;

    // 2. Transformación según formato (Strategy pattern simplificado)
    if (format.toLowerCase() === 'csv') {
      content = this.convertToCSV(incidents);
      contentType = 'text/csv';
    } else {
      content = JSON.stringify(incidents, null, 2);
      contentType = 'application/json';
    }

    return {
      filename,
      content,
      contentType,
    };
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    return `${headers}\n${rows}`;
  }
}