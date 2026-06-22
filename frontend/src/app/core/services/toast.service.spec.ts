import { TestBed } from '@angular/core/testing';
import { ToastService, ToastData } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit toast data when show is called', (done) => {
    const testMessage: ToastData = { message: 'Test message', type: 'info' };
    service.getToast().subscribe((toast) => {
      if (toast) { // Ignorar el valor inicial null
        expect(toast).toEqual(testMessage);
        done();
      }
    });
    service.show(testMessage.message, testMessage.type);
  });

  it('should emit null when clear is called', (done) => {
    // Primero mostramos un toast para asegurar que hay algo que limpiar
    service.show('Some message', 'success');

    service.getToast().subscribe((toast) => {
      if (toast === null) {
        expect(toast).toBeNull();
        done();
      }
    });
    service.clear();
  });

  it('should default to "info" type if not specified', (done) => {
    service.getToast().subscribe((toast) => {
      if (toast) {
        expect(toast.type).toBe('info');
        done();
      }
    });
    service.show('Default type message');
  });
});