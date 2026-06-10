import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReconciliationService } from '../services/reconciliation.service';
import { Account } from '../../../core/models/index';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-accounts-list',
  templateUrl: './accounts-list.component.html',
  styleUrls: ['./accounts-list.component.scss'],
})
export class AccountsListComponent {
  query = '';
  accounts: Account[] = [];
  loading = false;
  error = '';

  constructor(
    private readonly reconciliationService: ReconciliationService,
    private readonly router: Router
  ) {}

  onSearch(): void {
    if (!this.query.trim()) return;

    this.loading = true;
    this.error = '';
    
    this.reconciliationService.searchAccounts(this.query.trim())
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => (this.accounts = data),
        error: (err) => (this.error = err.message || 'Error al buscar cuentas'),
      });
  }

  viewDetail(accountId: string): void {
    this.router.navigate(['/reconciliation/accounts', accountId]);
  }
}