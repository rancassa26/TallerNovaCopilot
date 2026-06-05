import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/components/login.component';
import { ExportComponent } from './modules/reconciliation/components/export.component';
import { DashboardComponent } from './modules/reconciliation/components/dashboard.component';
import { AccountsComponent } from './modules/reconciliation/components/accounts.component';
import { AccountDetailComponent } from './modules/reconciliation/components/account-detail.component';
import { IncidentsComponent } from './modules/reconciliation/components/incidents.component';
import { UnauthorizedComponent } from './shared/unauthorized.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { Role } from './core/models/index';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'export',
    component: ExportComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Role.ADMIN] },
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Role.ADMIN, Role.VIEWER] },
  },
  {
    path: 'accounts',
    component: AccountsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Role.ADMIN, Role.VIEWER] },
  },
  {
    path: 'accounts/:id',
    component: AccountDetailComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Role.ADMIN, Role.VIEWER] },
  },
  {
    path: 'incidents',
    component: IncidentsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Role.ADMIN, Role.VIEWER] },
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
