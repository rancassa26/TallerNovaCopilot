import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserRole, UserPayload } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'tn_auth_token';
  private userSubject = new BehaviorSubject<UserPayload | null>(null);

  constructor() {
    this.loadUserFromStorage();
  }

  public get user$(): Observable<UserPayload | null> {
    return this.userSubject.asObservable();
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public hasRole(role: UserRole): boolean {
    const currentUser = this.userSubject.value;
    return currentUser?.role === role;
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    if (token) {
      // En una implementación real, aquí se decodificaría el JWT (e.g., usando jwt-decode)
      // Por ahora, simulamos la carga del payload
      this.userSubject.next({ sub: '1', username: 'admin', role: UserRole.ADMIN });
    }
  }
}