import { RoleGuard } from './role.guard';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/index';
import { of } from 'rxjs';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockAuthService {
  getCurrentUser$ = jasmine.createSpy('getCurrentUser$');
}

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(() => {
    authService = new MockAuthService();
    router = new MockRouter();
    guard = new RoleGuard(authService as any as AuthService, router as any as Router);
  });

  it('should allow access when user has the required role', (done) => {
    authService.getCurrentUser$.and.returnValue(of({ id: 'u1', email: 'test@example.com', roles: [Role.ADMIN] }));

    const route = { data: { roles: [Role.ADMIN] } } as any;

    const canActivate = guard.canActivate(route, {} as any) as any;

    canActivate.subscribe((result: boolean) => {
      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should redirect to unauthorized when the user lacks the required role', (done) => {
    authService.getCurrentUser$.and.returnValue(of({ id: 'u1', email: 'test@example.com', roles: [Role.VIEWER] }));

    const route = { data: { roles: [Role.ADMIN] } } as any;

    const canActivate = guard.canActivate(route, { url: '/export' } as any) as any;

    canActivate.subscribe((result: boolean) => {
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
      done();
    });
  });

  it('should redirect to login when there is no authenticated user', (done) => {
    authService.getCurrentUser$.and.returnValue(of(null));

    const route = { data: { roles: [Role.ADMIN] } } as any;

    const canActivate = guard.canActivate(route, { url: '/dashboard' } as any) as any;

    canActivate.subscribe((result: boolean) => {
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
