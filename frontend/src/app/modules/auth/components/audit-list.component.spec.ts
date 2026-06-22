import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuditListComponent } from './audit-list.component';
import { AuditService, AuditLog } from '../services/audit.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('AuditListComponent', () => {
  let component: AuditListComponent;
  let fixture: ComponentFixture<AuditListComponent>;
  let auditServiceSpy: jasmine.SpyObj<AuditService>;

  const mockAuditLogs: AuditLog[] = [
    {
      id: '1',
      userId: 'user1',
      action: 'LOGIN_SUCCESS',
      timestamp: new Date().toISOString(),
      details: { email: 'user1@example.com' },
      correlationId: 'corr-1',
    },
    {
      id: '2',
      userId: 'user2',
      action: 'RECONCILIATION_LOADED',
      timestamp: new Date().toISOString(),
      details: { source: 'file.json' },
      correlationId: 'corr-2',
    },
  ];

  beforeEach(async () => {
    auditServiceSpy = jasmine.createSpyObj('AuditService', [
      'getAuditLogs',
      'getAuditLogsByUser',
      'getAuditLogsByCorrelationId',
    ]);

    await TestBed.configureTestingModule({
      declarations: [AuditListComponent],
      imports: [FormsModule], // Importar FormsModule para ngModel
      providers: [{ provide: AuditService, useValue: auditServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all logs on ngOnInit', () => {
    auditServiceSpy.getAuditLogs.and.returnValue(of({ items: mockAuditLogs, total: 2 }));
    fixture.detectChanges(); // Llama a ngOnInit

    expect(auditServiceSpy.getAuditLogs).toHaveBeenCalledWith(1, 10);
    expect(component.logs).toEqual(mockAuditLogs);
    expect(component.totalItems).toBe(2);
    expect(component.loading).toBeFalse();
    expect(component.error).toBe('');
  });

  it('should handle error when loading all logs', () => {
    const errorMessage = 'Failed to fetch logs';
    auditServiceSpy.getAuditLogs.and.returnValue(
      throwError(() => new Error(errorMessage)),
    );
    fixture.detectChanges(); // Llama a ngOnInit

    expect(auditServiceSpy.getAuditLogs).toHaveBeenCalled();
    expect(component.logs).toEqual([]);
    expect(component.loading).toBeFalse();
    expect(component.error).toBe(errorMessage);
  });

  it('should go to next page and call fetchLogs', () => {
    auditServiceSpy.getAuditLogs.and.returnValue(of({ items: mockAuditLogs, total: 25 }));
    fixture.detectChanges();
    
    component.nextPage();
    
    expect(component.currentPage).toBe(2);
    expect(auditServiceSpy.getAuditLogs).toHaveBeenCalledWith(2, 10);
  });

  it('should go to previous page and call fetchLogs', () => {
    auditServiceSpy.getAuditLogs.and.returnValue(of({ items: mockAuditLogs, total: 25 }));
    fixture.detectChanges();
    
    component.currentPage = 2;
    component.previousPage();
    
    expect(component.currentPage).toBe(1);
    expect(auditServiceSpy.getAuditLogs).toHaveBeenCalledWith(1, 10);
  });

  // Podrías añadir más pruebas para filterByUserId y filterByCorrelationId
  // y sus respectivos escenarios de éxito y error.
});