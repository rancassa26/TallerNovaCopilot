import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReconciliationService } from '../services/reconciliation.service';
import { Account } from '../../../core/models/index';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent {
  query = '';
  accounts: Account[] = [];
  loading = false;
  error = '';

  constructor(
    private readonly reconciliationService: ReconciliationService,
    private readonly router: Router,
  ) {}

  search(): void {
    this.loading = true;
    this.error = '';
    this.accounts = [];

    this.reconciliationService.searchAccounts(this.query.trim()).subscribe({
      next: (result) => {
        this.accounts = result;
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message || 'No se pudieron buscar cuentas';
        this.loading = false;
      },
    });
  }

  openAccount(account: Account): void {
    this.router.navigate(['/accounts', account.id]);
  }
}
