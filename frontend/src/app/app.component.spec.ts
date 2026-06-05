import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';
import { Role } from './core/models/index';

class MockAuthService {
  getIsAuthenticated$ = jasmine.createSpy('getIsAuthenticated$').and.returnValue(of(true));
  hasRole$ = jasmine.createSpy('hasRole$').and.returnValue(of(true));
  logout = jasmine.createSpy('logout');
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    authService = new MockAuthService();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should call logout on AuthService when logout is invoked', () => {
    component.logout();

    expect(authService.logout).toHaveBeenCalled();
  });

  it('should render the logout button when authenticated', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('button')).toBeTruthy();
  });
});
