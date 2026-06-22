import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoggerService } from '../../../core/services/logger.service';
import { finalize } from 'rxjs/operators';

/**
 * LoginComponent - Smart component for user authentication
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string = '';
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private logger: LoggerService,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService
      .login(this.loginForm.value.email, this.loginForm.value.password)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          const redirect = this.returnUrl === '/' ? '/reconciliation/dashboard' : this.returnUrl;
          this.logger.log(`Login successful, redirecting to ${redirect}`);
          this.router.navigateByUrl(redirect);
        },
        error: (error) => {
          this.error = error?.message || 'Login failed';
          this.logger.error('Login failed', undefined, { error });
        },
      });
  }
}
