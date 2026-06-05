import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReconciliationService } from '../services/reconciliation.service';
import { Account } from '../../../core/models/index';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit {
  account: Account | null = null;
  loading = false;
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly reconciliationService: ReconciliationService,
  ) {}

  ngOnInit(): void {
    const accountId = this.route.snapshot.paramMap.get('id');
    if (accountId) {
      this.loadAccount(accountId);
    }
  }

  private loadAccount(accountId: string): void {
    this.loading = true;
    this.error = '';

    this.reconciliationService.getAccountDetail(accountId).subscribe({
      next: (result) => {
        this.account = result;
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message || 'No se pudo cargar la cuenta';
        this.loading = false;
      },
    });
  }
}
