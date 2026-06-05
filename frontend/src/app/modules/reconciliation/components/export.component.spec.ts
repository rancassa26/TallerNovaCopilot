import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ExportComponent } from './export.component';
import { ExportService } from '../services/export.service';
import { of, throwError } from 'rxjs';

class MockExportService {
  exportResults = jasmine.createSpy('exportResults');
  downloadFile = jasmine.createSpy('downloadFile');
}

describe('ExportComponent', () => {
  let component: ExportComponent;
  let fixture: ComponentFixture<ExportComponent>;
  let exportService: MockExportService;

  beforeEach(async () => {
    exportService = new MockExportService();

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ExportComponent],
      providers: [{ provide: ExportService, useValue: exportService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call exportResults and downloadFile when onExport succeeds', () => {
    const result = { filename: 'reconciliation.json', format: 'json', content: '{}' };
    exportService.exportResults.and.returnValue(of(result));

    component.onExport();

    expect(exportService.exportResults).toHaveBeenCalledWith(null, 'json');
    expect(exportService.downloadFile).toHaveBeenCalledWith(result);
    expect(component.successMessage).toContain('Archivo de exportación generado');
    expect(component.loading).toBeFalse();
  });

  it('should set error message when export fails', () => {
    exportService.exportResults.and.returnValue(throwError(() => new Error('Network error')));

    component.onExport();

    expect(component.error).toBe('Network error');
    expect(component.loading).toBeFalse();
    expect(exportService.downloadFile).not.toHaveBeenCalled();
  });
});
