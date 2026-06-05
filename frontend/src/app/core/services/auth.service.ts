import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClientService } from './http-client.service';
import { LoggerService } from './logger.service';
import { CorrelationIdService } from './correlation-id.service';
import { User, LoginRequest, LoginResponse, Role } from '../models/index';

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

  constructor(
    private httpClient: HttpClientService,
    private logger: LoggerService,
    private correlationIdService: CorrelationIdService,
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

    return new Observable((observer) => {
      this.httpClient.post<LoginResponse>('/auth/login', { email, password })
        .subscribe({
          next: (response) => {
            this.storeToken(response.token);
            this.currentUser$.next(response.user);
            this.isAuthenticated$.next(true);
            this.logger.log(`Login successful for ${email}`, correlationId);
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            this.logger.error(`Login failed for ${email}`, correlationId, { error });
            observer.error(error);
          },
        });
    });
  }

  logout(): void {
    const correlationId = this.correlationIdService.getCorrelationId();
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
        this.currentUser$.next({
          id: decoded.sub,
          email: decoded.email,
          roles: decoded.roles,
        });
        this.isAuthenticated$.next(true);
      } catch {
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
}
