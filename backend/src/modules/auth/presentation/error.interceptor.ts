import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

/**
 * ErrorInterceptor - Captura errores HTTP globales.
 * Si detecta un 401 (Unauthorized), fuerza el cierre de sesión.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly injector: Injector) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Obtenemos AuthService vía Injector para evitar dependencias circulares
          const authService = this.injector.get(AuthService);
          
          // Forzamos el logout: limpia tokens y actualiza el estado de autenticación
          authService.logout();
          
          // Nota: El redireccionamiento a /login suele ocurrir automáticamente 
          // si tienes componentes suscritos al estado de autenticación o mediante Guards.
        }

        return throwError(() => error);
      })
    );
  }
}