import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  constructor(private readonly snackBar: MatSnackBar) {}

  /**
   * Muestra un mensaje de error.
   * @param message El mensaje descriptivo del error.
   * @param action El texto de la acción (por defecto el status del error o 'Cerrar').
   */
  showError(message: string, action: string = 'Cerrar'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['toast-error'],
    });
  }

  /**
   * Muestra un mensaje de éxito.
   */
  showSuccess(message: string, action: string = 'OK'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['toast-success'],
    });
  }
}