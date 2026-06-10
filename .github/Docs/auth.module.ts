import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './components/login.component';
import { UnauthorizedComponent } from './components/unauthorized.component';

/**
 * AuthModule - Maneja la presentación de autenticación
 */
@NgModule({
  declarations: [LoginComponent, UnauthorizedComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }