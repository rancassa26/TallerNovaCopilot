import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ReconciliationService } from '../services/reconciliation.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DashboardResult } from '../../../core/models/index';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let reconciliationService: jasmine.SpyObj<ReconciliationService>;
  let router: jasmine.SpyObj<Router>;

  const mockDashboardData: DashboardResult = {
    totalReconciliations: 10,
    totalAccounts: 50,
    totalIncidents: 5,
    totalDifference: 1000,
    incidentsByType: { 'BALANCE_MISMATCH': 5 },
    recentReconciliations: []
  };

  beforeEach(async () => {
    reconciliationService = jasmine.createSpyObj('ReconciliationService', ['getDashboard', 'validateReconciliation']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    // Configuración de respuestas por defecto para los mocks
    reconciliationService.getDashboard.and.returnValue(of(mockDashboardData));
    reconciliationService.validateReconciliation.and.returnValue(of({ 
        reconciliationId: 'REC-001', 
        valid: true, 
        validations: [] 
    } as any));

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: ReconciliationService, useValue: reconciliationService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    // Act
    fixture.detectChanges(); // Dispara ngOnInit -> loadDashboard
    
    // Assert
    expect(reconciliationService.getDashboard).toHaveBeenCalled();
    // Accedemos a la propiedad privada para verificar que los datos se asignaron correctamente
    expect((component as any).dashboardData).toEqual(mockDashboardData);
    expect(component.loading).toBeFalse();
  });

  it('should call animateAllKPIs when dashboard$ emits data', () => {
    // Arrange
    const animateSpy = spyOn(component as any, 'animateAllKPIs');
    
    // Act
    fixture.detectChanges(); // ngOnInit -> loadDashboard -> la suscripción del pipe async dispara el tap
    
    // Assert
    expect(animateSpy).toHaveBeenCalledWith(mockDashboardData);
  });

  it('should reload KPIs (call getDashboard) after successful onValidate', () => {
    // 1. Simular la carga inicial del componente
    fixture.detectChanges();
    expect(reconciliationService.getDashboard).toHaveBeenCalledTimes(1);

    const reconciliationId = 'REC-001';
    
    // 2. Ejecutar la acción de validación
    component.onValidate(reconciliationId);

    // 3. Verificaciones
    expect(reconciliationService.validateReconciliation).toHaveBeenCalledWith(reconciliationId);
    // El punto crítico: getDashboard debe haberse llamado una segunda vez para refrescar los KPIs tras el éxito
    expect(reconciliationService.getDashboard).toHaveBeenCalledTimes(2);
  });

  it('should handle error and not reload KPIs if validation fails', () => {
    fixture.detectChanges();
    expect(reconciliationService.getDashboard).toHaveBeenCalledTimes(1);

    const reconciliationId = 'REC-001';
    const errorMsg = 'Error en el servidor de validación';
    reconciliationService.validateReconciliation.and.returnValue(throwError(() => new Error(errorMsg)));

    // Act
    component.onValidate(reconciliationId);

    // Assert
    expect(reconciliationService.validateReconciliation).toHaveBeenCalledWith(reconciliationId);
    // No debe llamarse a getDashboard de nuevo si la validación falló
    expect(reconciliationService.getDashboard).toHaveBeenCalledTimes(1);
    expect(component.error).toBe(errorMsg);
  });

  it('should initialize the chart when ViewChild incidentChart is set and data exists', () => {
    const initChartSpy = spyOn(component as any, 'initChart').and.callThrough();
    const mockCanvas = document.createElement('canvas');
    const mockElementRef = new ElementRef(mockCanvas);

    // 1. Cargamos datos primero ya que el setter verifica que existan
    fixture.detectChanges();
    
    // 2. Simulamos la asignación del ViewChild por parte de Angular
    component.chartCanvas = mockElementRef;

    expect(initChartSpy).toHaveBeenCalledWith(mockCanvas, mockDashboardData);
    expect((component as any).chart).toBeDefined();
  });

  it('should initialize the chart with the correct background colors in the dataset', () => {
    const mockCanvas = document.createElement('canvas');
    const mockElementRef = new ElementRef(mockCanvas);
    const expectedColors = ['#0d6efd', '#0dcaf0', '#ffc107', '#dc3545', '#6c757d'];

    // 1. Preparamos el estado inicial
    fixture.detectChanges();
    
    // 2. Disparamos la creación del gráfico
    component.chartCanvas = mockElementRef;

    const chartInstance = (component as any).chart;
    const dataset = chartInstance.config.data.datasets[0];

    // 3. Verificamos que la configuración de colores sea la correcta
    expect(dataset.backgroundColor).toEqual(expectedColors);
    expect(dataset.borderWidth).toBe(0);
  });

  it('should initialize the chart with labels matching the incidentsByType keys', () => {
    const mockCanvas = document.createElement('canvas');
    const mockElementRef = new ElementRef(mockCanvas);
    const expectedLabels = Object.keys(mockDashboardData.incidentsByType!);

    // 1. Preparamos el estado inicial (carga de datos)
    fixture.detectChanges();
    
    // 2. Disparamos la creación del gráfico asignando el ViewChild
    component.chartCanvas = mockElementRef;

    const chartInstance = (component as any).chart;
    expect(chartInstance.config.data.labels).toEqual(expectedLabels);
  });

  describe('animateNumber', () => {
    it('should incrementally update animatedKPIs values until reaching the target', fakeAsync(() => {
      // Inicializamos el valor en 0
      component.animatedKPIs.totalIncidents = 0;
      const targetValue = 100;

      // Accedemos al método privado mediante casting a any para validar su lógica interna
      (component as any).animateNumber('totalIncidents', targetValue);

      // Avanzamos 100ms (la duración total es 1500ms)
      tick(100);
      expect(component.animatedKPIs.totalIncidents).toBeGreaterThan(0);
      expect(component.animatedKPIs.totalIncidents).toBeLessThan(targetValue);

      // Avanzamos hasta la mitad del tiempo (750ms totales)
      // easeOutQuart(0.5) = 1 - (1 - 0.5)^4 = 0.9375. Por lo tanto: 0 + (100 - 0) * 0.9375 = 93.75
      tick(650);
      expect(component.animatedKPIs.totalIncidents).toBeCloseTo(93.75, 1);

      // Avanzamos hasta completar el tiempo total y limpiamos frames restantes
      tick(750);
      flush();

      expect(component.animatedKPIs.totalIncidents).toBe(targetValue);
    }));
  });
});