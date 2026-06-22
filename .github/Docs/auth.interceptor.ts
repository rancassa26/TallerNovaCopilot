import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly injector: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Usamos Injector para obtener las dependencias y evitar ciclos de inyección
    const authService = this.injector.get(AuthService);
    const toastService = this.injector.get(ToastService);
    const logger = this.injector.get(LoggerService);

    const token = authService.getToken();
    
    // Implementación de Observabilidad: Correlation ID obligatorio según instrucciones
    const correlationId = crypto.randomUUID();

    let headers = req.headers.set('X-Correlation-Id', correlationId);

    // Implementación de Seguridad: JWT obligatorio según instrucciones
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const authReq = req.clone({ headers });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ha ocurrido un error inesperado';

        // 1. Manejo de errores específicos por código de estado
        if (error.status === 401) {
          errorMessage = 'Su sesión ha expirado. Por favor, ingrese de nuevo.';
          authService.logout();
        } else if (error.status === 403) {
          errorMessage = 'No tiene permisos para realizar esta acción.';
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión.';
        } else {
          // Intentar extraer mensaje del backend (ver GlobalExceptionFilter en backend)
          errorMessage = error.error?.message || error.message || errorMessage;
        }

        // 2. Notificación Global mediante ToastService
        toastService.showError(errorMessage, `Error ${error.status || 'de Red'}`);

        // 3. Log técnico: Registramos el Correlation ID (priorizando el del backend si existe)
        const serverCorrelationId = error.error?.correlationId;
        const tracingId = serverCorrelationId || correlationId;

        logger.error(`Error en petición HTTP: ${errorMessage}`, tracingId, {
          clientGeneratedId: correlationId,
          status: error.status,
          url: req.urlWithParams
        });

        return throwError(() => error);
      })
    );
  }
}