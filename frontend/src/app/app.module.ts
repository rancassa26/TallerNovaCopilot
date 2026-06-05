import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ReconciliationModule } from './modules/reconciliation/reconciliation.module';
import { LoginComponent } from './modules/auth/components/login.component';
import { UnauthorizedComponent } from './shared/unauthorized.component';

@NgModule({
  declarations: [AppComponent, LoginComponent, UnauthorizedComponent],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, HttpClientModule, ReconciliationModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
