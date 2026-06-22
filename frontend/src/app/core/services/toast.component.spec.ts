import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService, ToastData } from '../../services/toast.service';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let mockToastService: { toast$: BehaviorSubject<ToastData | null>; getToast: () => BehaviorSubject<ToastData | null>; clear: jasmine.Spy };

  beforeEach(async () => {
    mockToastService = {
      toast$: new BehaviorSubject<ToastData | null>(null),
      getToast: () => mockToastService.toast$,
      clear: jasmine.createSpy('clear'),
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [ToastComponent],
      providers: [{ provide: ToastService, useValue: mockToastService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display toast message when toastService emits data', () => {
    const testToast: ToastData = { message: 'Success!', type: 'success' };
    mockToastService.toast$.next(testToast);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.toast-text').textContent).toContain('Success!');
    expect(compiled.querySelector('.toast-message').classList).toContain('toast-success');
    expect(compiled.querySelector('.toast-icon i.bi-check-circle-fill')).toBeTruthy();
  });

  it('should hide toast message when toastService emits null', () => {
    mockToastService.toast$.next({ message: 'Warning!', type: 'warning' });
    fixture.detectChanges();

    mockToastService.toast$.next(null);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.toast-overlay')).toBeNull();
  });

  it('should call toastService.clear() when close button is clicked', () => {
    mockToastService.toast$.next({ message: 'Info!', type: 'info' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const closeButton = compiled.querySelector('.toast-close');
    closeButton.click();
    fixture.detectChanges();

    expect(mockToastService.clear).toHaveBeenCalled();
  });

  it('should execute action callback and clear toast when action button is clicked', () => {
    const callbackSpy = jasmine.createSpy('callback');
    const testToast: ToastData = {
      message: 'Expiring soon',
      type: 'warning',
      action: { label: 'Renew', callback: callbackSpy }
    };

    mockToastService.toast$.next(testToast);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const actionButton = compiled.querySelector('.btn-action');
    expect(actionButton.textContent).toContain('Renew');

    actionButton.click();

    expect(callbackSpy).toHaveBeenCalled();
    expect(mockToastService.clear).toHaveBeenCalled();
  });
});