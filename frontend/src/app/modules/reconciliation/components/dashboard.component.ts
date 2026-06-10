import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ReconciliationService } from '../services/reconciliation.service';
import { DashboardResult, ReconciliationSummary } from '../../../core/models/index';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { Router } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  dashboard$: Observable<DashboardResult | null> = of(null);
  loading = false;
  error = '';

  private chart?: Chart;
  private dashboardData: DashboardResult | null = null;

  @ViewChild('incidentChart') set chartCanvas(content: ElementRef<HTMLCanvasElement>) {
    if (content && this.dashboardData) {
      this.initChart(content.nativeElement, this.dashboardData);
    }
  }

  constructor(
    private readonly reconciliationService: ReconciliationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.dashboard$ = this.reconciliationService.getDashboard().pipe(
      tap(data => this.dashboardData = data),
      finalize(() => (this.loading = false)),
      catchError((err: Error) => {
        this.error = err.message || 'No se pudo cargar el dashboard';
        return of(null);
      })
    );
  }

  private initChart(canvas: HTMLCanvasElement, data: DashboardResult): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = Object.keys(data.incidentsByType || {});
    const values = Object.values(data.incidentsByType || {});

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: ['#0d6efd', '#0dcaf0', '#ffc107', '#dc3545', '#6c757d'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  viewReconciliationDetail(reconciliationId: string): void {
    this.router.navigate(['/reconciliation/incidents'], { queryParams: { reconciliationId: reconciliationId } });
  }
}
