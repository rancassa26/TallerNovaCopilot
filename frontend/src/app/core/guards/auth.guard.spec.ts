import { AuthGuard } from './auth.guard';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockAuthService {
  isTokenValid = jasmine.createSpy('isTokenValid');
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(() => {
    authService = new MockAuthService();
    router = new MockRouter();
    guard = new AuthGuard(authService as any as AuthService, router as any as Router);
  });

  it('should allow activation when token is valid', () => {
    authService.isTokenValid.and.returnValue(true);

    const result = guard.canActivate(null as any, null as any);

    expect(result).toBe(true);
  });

  it('should redirect to login when token is invalid', () => {
    authService.isTokenValid.and.returnValue(false);

    const result = guard.canActivate({} as any, { url: '/dashboard' } as any);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/dashboard' } });
  });
});
