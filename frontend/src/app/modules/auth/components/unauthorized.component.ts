import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * UnauthorizedComponent - Vista para usuarios autenticados sin roles suficientes
 */
@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss'],
})
export class UnauthorizedComponent {
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  goToDashboard(): void {
    this.router.navigate(['/reconciliation/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}