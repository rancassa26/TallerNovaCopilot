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

  public animatedKPIs = {
    totalReconciliations: 0,
    totalAccounts: 0,
    totalIncidents: 0,
    totalDifference: 0
  };

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
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.dashboard$ = this.reconciliationService.getDashboard().pipe(
      tap((data) => {
        if (data) {
          this.dashboardData = data;
          this.animateAllKPIs(data);
        }
      }),
      finalize(() => (this.loading = false)),
      catchError((err: Error) => {
        this.error = err.message || 'No se pudo cargar el dashboard';
        return of(null);
      }),
    );
  }

  /**
   * Inicia la animación coordinada de todos los indicadores numéricos.
   */
  private animateAllKPIs(data: DashboardResult): void {
    this.animateNumber('totalReconciliations', data.totalReconciliations);
    this.animateNumber('totalAccounts', data.totalAccounts);
    this.animateNumber('totalIncidents', data.totalIncidents);
    this.animateNumber('totalDifference', data.totalDifference);
  }

  /**
   * Realiza una animación de conteo (Lerp con Easing) para una propiedad específica.
   */
  private animateNumber(key: keyof typeof this.animatedKPIs, target: number): void {
    const start = this.animatedKPIs[key];
    const duration = 1500; // Duración en ms
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: easeOutQuart para una desaceleración suave al final
      const ease = 1 - Math.pow(1 - progress, 4);
      
      this.animatedKPIs[key] = start + (target - start) * ease;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.animatedKPIs[key] = target;
      }
    };
    requestAnimationFrame(step);
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

  /**
   * Ejecuta la validación de una conciliación y refresca los KPIs del dashboard.
   * @param reconciliationId ID de la conciliación a validar.
   */
  onValidate(reconciliationId: string): void {
    this.loading = true;
    this.error = '';

    this.reconciliationService
      .validateReconciliation(reconciliationId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.loadDashboard(); // Actualiza automáticamente los KPIs tras la validación
        },
        error: (err) => (this.error = err.message || 'Error al validar la conciliación'),
      });
  }
}
