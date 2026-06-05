import { Component } from '@angular/core';
import { ReconciliationService } from '../services/reconciliation.service';
import { IncidentResult } from '../../../core/models/index';

@Component({
  selector: 'app-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.scss'],
})
export class IncidentsComponent {
  reconciliationId = '';
  incidents: IncidentResult[] = [];
  loading = false;
  error = '';

  constructor(private readonly reconciliationService: ReconciliationService) {}

  search(): void {
    this.loading = true;
    this.error = '';
    this.incidents = [];

    const reconciliationId = this.reconciliationId.trim() || undefined;

    this.reconciliationService.getIncidents(reconciliationId).subscribe({
      next: (result) => {
        this.incidents = result;
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message || 'No se pudieron obtener los incidentes';
        this.loading = false;
      },
    });
  }
}
