import { Injectable, Inject } from '@nestjs/common';
import { NotFoundException } from '../../../common/exceptions/base.exception';
import { IReconciliationRepository } from '../domain/reconciliation.repository.interface';
import { Account } from '../domain/account.entity';

@Injectable()
export class GetAccountDetailUseCase {
  constructor(
    @Inject('IReconciliationRepository')
    private readonly reconciliationRepository: IReconciliationRepository,
  ) {}

  async execute(accountId: string, correlationId: string): Promise<Account> {
    const account = await this.reconciliationRepository.findAccountById(accountId);

    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found`, correlationId);
    }

    return account;
  }
}
