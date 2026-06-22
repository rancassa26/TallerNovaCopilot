import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ValidateReconciliationResult, AccountValidationResult } from '../../../../core/models/index';

/**
 * ReconciliationValidationModalComponent - Componente modal para mostrar los resultados detallados de la validación de conciliación.
 */
@Component({
  selector: 'app-reconciliation-validation-modal',
  templateUrl: './reconciliation-validation-modal.component.html',
  styleUrls: ['./reconciliation-validation-modal.component.scss']
})
export class ReconciliationValidationModalComponent {
  displayedColumns: string[] = [
    'accountId',
    'accountName',
    'ledgerBalance',
    'systemBalance',
    'difference',
    'valid',
    'issues'
  ];

  constructor(
    public dialogRef: MatDialogRef<ReconciliationValidationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ValidateReconciliationResult
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  // Helper para acceder a los datos de la tabla
  get validationsDataSource(): AccountValidationResult[] {
    return this.data.validations;
  }
}