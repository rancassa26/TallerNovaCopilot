import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CorrelationIdService } from '../services/correlation-id.service';

/**
 * AuthInterceptor - Inyecta JWT y Correlation ID en todas las peticiones salientes
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly correlationIdService: CorrelationIdService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('auth_token');
    const correlationId = this.correlationIdService.getCorrelationId();

    let headers = req.headers.set('X-Correlation-ID', correlationId);

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const authReq = req.clone({ headers });
    return next.handle(authReq);
  }
}