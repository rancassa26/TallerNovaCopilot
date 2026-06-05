import { Injectable, Inject } from '@nestjs/common';
import { IReconciliationRepository } from '../domain/reconciliation.repository.interface';
import { Account } from '../domain/account.entity';

@Injectable()
export class SearchAccountsUseCase {
  constructor(
    @Inject('IReconciliationRepository')
    private readonly reconciliationRepository: IReconciliationRepository,
  ) {}

  async execute(query: string): Promise<Account[]> {
    return this.reconciliationRepository.searchAccounts(query);
  }
}
