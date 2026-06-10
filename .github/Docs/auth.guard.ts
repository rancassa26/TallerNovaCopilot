import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const expectedRoles: UserRole[] = route.data['roles'];
    if (expectedRoles && expectedRoles.length > 0) {
      const hasRequiredRole = expectedRoles.some((role) => this.authService.hasRole(role));
      
      if (!hasRequiredRole) {
        // Si el usuario no tiene el rol necesario (ADMIN vs VIEWER), redirigir al dashboard
        this.router.navigate(['/reconciliation/dashboard']);
        return false;
      }
    }

    return true;
  }
}