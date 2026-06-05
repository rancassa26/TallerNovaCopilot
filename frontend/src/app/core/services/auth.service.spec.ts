import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClientService } from './http-client.service';
import { LoggerService } from './logger.service';
import { CorrelationIdService } from './correlation-id.service';
import { Role } from '../models/index';

class MockHttpClientService {
  post = jasmine.createSpy('post');
}

class MockLoggerService {
  log = jasmine.createSpy('log');
  error = jasmine.createSpy('error');
}

class MockCorrelationIdService {
  getCorrelationId = jasmine.createSpy('getCorrelationId').and.returnValue('corr-1');
}

describe('AuthService', () => {
  let service: AuthService;
  let httpClient: MockHttpClientService;
  let logger: MockLoggerService;
  let correlationIdService: MockCorrelationIdService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClientService, useClass: MockHttpClientService },
        { provide: LoggerService, useClass: MockLoggerService },
        { provide: CorrelationIdService, useClass: MockCorrelationIdService },
      ],
    });

    service = TestBed.inject(AuthService);
    httpClient = TestBed.inject(HttpClientService) as any;
    logger = TestBed.inject(LoggerService) as any;
    correlationIdService = TestBed.inject(CorrelationIdService) as any;
  });

  it('should set authenticated user after successful login', (done) => {
    const response = {
      token: 'header.' + btoa(JSON.stringify({ sub: 'u1', email: 'test@example.com', roles: [Role.ADMIN], exp: Math.floor(Date.now() / 1000) + 60 })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') + '.signature',
      user: { id: 'u1', email: 'test@example.com', roles: [Role.ADMIN] },
    };
    httpClient.post.and.returnValue(of(response));

    service.login('test@example.com', 'password').subscribe((result) => {
      expect(result).toEqual(response);

      service.getIsAuthenticated$().subscribe((isAuthenticted) => {
        expect(isAuthenticted).toBeTrue();
        service.getCurrentUser$().subscribe((user) => {
          expect(user).toEqual(response.user);
          done();
        });
      });
    });
  });

  it('should report hasRole$ correctly for current user', (done) => {
    service['currentUser$'].next({ id: 'u1', email: 'test@example.com', roles: [Role.ADMIN] });

    service.hasRole$(Role.ADMIN).subscribe((hasRole) => {
      expect(hasRole).toBeTrue();
      done();
    });
  });

  it('should clear authentication state on logout', (done) => {
    localStorage.setItem('auth_token', 'any-token');
    service['currentUser$'].next({ id: 'u1', email: 'test@example.com', roles: [Role.ADMIN] });
    service['isAuthenticated$'].next(true);

    service.logout();

    expect(localStorage.getItem('auth_token')).toBeNull();
    service.getIsAuthenticated$().subscribe((isAuthenticated) => {
      expect(isAuthenticated).toBeFalse();
      service.getCurrentUser$().subscribe((user) => {
        expect(user).toBeNull();
        done();
      });
    });
  });
});
