import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ExportComponent } from './components/export.component';
import { DashboardComponent } from './components/dashboard.component';
import { AccountsComponent } from './components/accounts.component';
import { AccountDetailComponent } from './components/account-detail.component';
import { IncidentsComponent } from './components/incidents.component';

@NgModule({
  declarations: [ExportComponent, DashboardComponent, AccountsComponent, AccountDetailComponent, IncidentsComponent],
  imports: [CommonModule, FormsModule, RouterModule],
  exports: [ExportComponent],
})
export class ReconciliationModule {}
