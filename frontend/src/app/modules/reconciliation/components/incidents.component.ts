import { Component, OnInit } from '@angular/core';
import { ReconciliationService } from '../services/reconciliation.service';
import { AuthService } from '../../../core/services/auth.service';
import { IncidentResult, Role } from '../../../core/models/index';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.scss'],
})
export class IncidentsComponent implements OnInit {
  reconciliationId = '';
  selectedStatus = '';
  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'RESOLVED', label: 'Resuelto' },
    { value: 'INVESTIGATING', label: 'En Investigación' }
  ];
  incidents: IncidentResult[] = [];
  loading = false;
  error = '';
  isAdmin$: Observable<boolean>;

  constructor(
    private readonly reconciliationService: ReconciliationService,
    private readonly authService: AuthService
  ) {
    this.isAdmin$ = this.authService.hasRole$(Role.ADMIN);
  }

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.loading = true;
    this.error = '';
    this.incidents = [];

    const reconciliationId = this.reconciliationId.trim() || undefined;
    const status = this.selectedStatus || undefined;

    this.reconciliationService.getIncidents(reconciliationId, status).subscribe({
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

  updateStatus(incident: IncidentResult, newStatus: string): void {
    if (incident.status === newStatus) return;

    this.loading = true;
    this.reconciliationService.updateIncidentStatus(incident.id, newStatus).subscribe({
      next: () => {
        incident.status = newStatus;
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message || 'Error al actualizar el estado';
        this.loading = false;
      },
    });
  }
}
