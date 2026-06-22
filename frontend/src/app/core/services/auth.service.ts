import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpClientService } from './http-client.service';
import { LoggerService } from './logger.service';
import { CorrelationIdService } from './correlation-id.service';
import { User, LoginResponse, Role } from '../models/index';
import { ToastService } from './toast.service';

/**
 * AuthService - Manages authentication state and operations
 * No framework dependencies for business logic
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private expirationTimer: any;
  private warningTimer: any;

  constructor(
    private httpClient: HttpClientService,
    private logger: LoggerService,
    private correlationIdService: CorrelationIdService,
    private toastService: ToastService,
  ) {
    this.loadStoredToken();
  }

  // Selectors
  getCurrentUser$(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  getIsAuthenticated$(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  hasRole$(role: Role): Observable<boolean> {
    return new Observable((observer) => {
      this.currentUser$.subscribe((user) => {
        observer.next(user?.roles?.includes(role) ?? false);
      });
    });
  }

  // Operations
  login(email: string, password: string): Observable<LoginResponse> {
    const correlationId = this.correlationIdService.getCorrelationId();
    this.logger.log(`Attempting login for ${email}`, correlationId);

    return this.httpClient.post<LoginResponse>('/auth/login', { email, password }).pipe(
      tap((response) => {
        this.storeToken(response.token);
        // Sincronizamos el estado interno con la respuesta del servidor
        this.currentUser$.next(response.user);
        this.isAuthenticated$.next(true);
        this.logger.log(`Login successful for ${email}`, correlationId);

        // Iniciar temporizador de expiración
        try {
          const decoded = this.decodeToken(response.token);
          this.setExpirationTimer(decoded.exp * 1000);
        } catch (err) {
          this.logger.error('Could not set expiration timer', correlationId, { err });
        }
      }),
      catchError((error) => {
        this.logger.error(`Login failed for ${email}`, correlationId, { error });
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<LoginResponse> {
    const correlationId = this.correlationIdService.getCorrelationId();
    this.logger.log('Attempting to refresh session token', correlationId);

    return this.httpClient.post<LoginResponse>('/auth/refresh', {}).pipe(
      tap((response) => {
        this.storeToken(response.token);
        this.currentUser$.next(response.user);
        this.isAuthenticated$.next(true);
        
        const decoded = this.decodeToken(response.token);
        this.setExpirationTimer(decoded.exp * 1000);
        
        this.toastService.clear();
        this.logger.log('Session refreshed successfully', correlationId);
      }),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    const correlationId = this.correlationIdService.getCorrelationId();

    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    this.toastService.clear();

    this.clearToken();
    this.currentUser$.next(null);
    this.isAuthenticated$.next(false);
    this.logger.log('Logout successful', correlationId);
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = this.decodeToken(token);
      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      return expiryTime > Date.now();
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private storeToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private clearToken(): void {
    localStorage.removeItem('auth_token');
  }

  private loadStoredToken(): void {
    const token = this.getToken();
    if (token && this.isTokenValid()) {
      try {
        const decoded = this.decodeToken(token);
        this.setExpirationTimer(decoded.exp * 1000);

        // Reconstruimos el objeto User a partir del payload del JWT
        this.currentUser$.next({
          id: decoded.sub || '',
          email: decoded.email || '',
          roles: (decoded.roles as Role[]) || [],
        });
        this.isAuthenticated$.next(true);
        this.logger.debug('User session restored from JWT');
      } catch {
        this.logger.warn('Failed to restore session: Invalid token format');
        this.clearToken();
      }
    }
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch {
      throw new Error('Invalid token');
    }
  }

  private setExpirationTimer(expirationDate: number): void {
    const timeout = expirationDate - Date.now();
    const warningTimeout = timeout - 60000; // 1 minuto antes de la expiración

    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }

    if (warningTimeout > 0) {
      this.warningTimer = setTimeout(() => {
        this.toastService.show('Su sesión expirará en 1 minuto.', 'warning', {
          label: 'Renovar Sesión',
          callback: () => this.refreshToken().subscribe()
        });
      }, warningTimeout);
    }

    if (timeout > 0) {
      this.expirationTimer = setTimeout(() => {
        this.toastService.clear();
        this.logger.warn('Token expired. Automatic logout triggered.');
        this.logout();
      }, timeout);
    }
  }
}
