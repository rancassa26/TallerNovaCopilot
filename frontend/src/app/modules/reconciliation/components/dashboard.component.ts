import { Component, OnInit } from '@angular/core';
import { ReconciliationService } from '../services/reconciliation.service';
import { DashboardResult } from '../../../core/models/index';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  dashboard: DashboardResult | null = null;
  loading = false;
  error = '';

  constructor(private readonly reconciliationService: ReconciliationService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading = true;
    this.error = '';

    this.reconciliationService.getDashboard().subscribe({
      next: (result) => {
        this.dashboard = result;
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message || 'No se pudo cargar el dashboard';
        this.loading = false;
      },
    });
  }
}
