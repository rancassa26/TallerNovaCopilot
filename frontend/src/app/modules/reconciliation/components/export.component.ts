import { Component } from '@angular/core';
import { ExportService } from '../services/export.service';
import { ExportResult } from '../../../core/models/index';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
})
export class ExportComponent {
  reconciliationId = '';
  format: 'json' | 'csv' = 'json';
  loading = false;
  error = '';
  successMessage = '';

  constructor(private readonly exportService: ExportService) {}

  onExport(): void {
    this.loading = true;
    this.error = '';
    this.successMessage = '';

    const reconciliationId = this.reconciliationId?.trim() || null;

    this.exportService.exportResults(reconciliationId, this.format).subscribe({
      next: (result: ExportResult) => {
        this.exportService.downloadFile(result);
        this.successMessage = `Archivo de exportación generado: ${result.filename}`;
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message || 'Error al generar la exportación';
        this.loading = false;
      },
    });
  }
}
