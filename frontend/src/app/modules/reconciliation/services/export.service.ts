import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../core/services/http-client.service';
import { LoggerService } from '../../../core/services/logger.service';
import { ExportResult } from '../../../core/models/index';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(
    private readonly httpClient: HttpClientService,
    private readonly logger: LoggerService,
  ) {}

  exportResults(
    reconciliationId: string | null,
    format: 'json' | 'csv' = 'json',
  ): Observable<ExportResult> {
    const queryParams: string[] = [];

    if (reconciliationId) {
      queryParams.push(`reconciliationId=${encodeURIComponent(reconciliationId)}`);
    }

    queryParams.push(`format=${encodeURIComponent(format)}`);

    const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
    return this.httpClient.get<ExportResult>(`/reconciliation/export${queryString}`);
  }

  downloadFile(result: ExportResult): void {
    const mimeType = result.format === 'csv' ? 'text/csv' : 'application/json';
    const blob = new Blob([result.content], { type: `${mimeType};charset=utf-8` });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    this.logger.log(`Export file generated: ${result.filename}`);
  }
}
