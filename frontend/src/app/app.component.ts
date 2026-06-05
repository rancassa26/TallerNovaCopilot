import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { Role } from './core/models/index';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'TallerNova Exportación';
  isAuthenticated$: Observable<boolean>;
  isAdmin$: Observable<boolean>;

  constructor(private readonly authService: AuthService) {
    this.isAuthenticated$ = this.authService.getIsAuthenticated$();
    this.isAdmin$ = this.authService.hasRole$(Role.ADMIN);
  }

  logout(): void {
    this.authService.logout();
  }
}
