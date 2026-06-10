import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReconciliationService } from '../services/reconciliation.service';
import { Account } from '../../../core/models/index';
import { Observable, catchError, of } from 'rxjs';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit {
  account$: Observable<Account | null> = of(null);
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly reconciliationService: ReconciliationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.account$ = this.reconciliationService.getAccountDetail(id).pipe(
        catchError((err) => {
          this.error = 'No se pudo cargar el detalle de la cuenta.';
          return of(null);
        })
      );
    }
  }
}