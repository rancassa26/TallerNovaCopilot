import { Component } from '@angular/core';
import { ReconciliationService } from '../services/reconciliation.service';
import { LoggerService } from '../../../core/services/logger.service';

@Component({
  selector: 'app-load-reconciliation',
  templateUrl: './load-reconciliation.component.html',
  styleUrls: ['./load-reconciliation.component.scss'],
})
export class LoadReconciliationComponent {
  fileContent: any = null;
  fileName: string = '';
  loading = false;
  error = '';
  successMessage = '';

  constructor(
    private readonly reconciliationService: ReconciliationService,
    private readonly logger: LoggerService
  ) {}

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.error = '';
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          this.fileContent = JSON.parse(e.target.result);
        } catch (err) {
          this.error = 'El archivo no es un JSON válido.';
          this.fileContent = null;
        }
      };
      reader.readAsText(file);
    }
  }

  onUpload(): void {
    if (!this.fileContent) {
      this.error = 'Por favor, selecciona un archivo válido primero.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    this.reconciliationService.loadReconciliation(this.fileContent).subscribe({
      next: (response) => {
        this.successMessage = 'Conciliación cargada y procesada con éxito.';
        this.loading = false;
        this.fileContent = null;
        this.fileName = '';
        this.logger.log('File upload successful');
      },
      error: (err: Error) => {
        this.error = err.message || 'Error al procesar la conciliación en el servidor.';
        this.loading = false;
        this.logger.error('File upload failed', undefined, { error: err });
      },
    });
  }
}