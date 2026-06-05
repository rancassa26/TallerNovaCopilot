import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Reconciliation } from '../domain/reconciliation.entity';
import { Account, AccountIncident } from '../domain/account.entity';
import { IReconciliationRepository } from '../domain/reconciliation.repository.interface';
import { LoadReconciliationInputDto } from './dto/load-reconciliation.input.dto';

export interface LoadReconciliationResult {
  reconciliationId: string;
  source: string;
  totalAccounts: number;
  totalDifference: number;
  totalIncidents: number;
}

@Injectable()
export class LoadReconciliationUseCase {
  constructor(
    @Inject('IReconciliationRepository')
    private readonly reconciliationRepository: IReconciliationRepository,
  ) {}

  async execute(
    input: LoadReconciliationInputDto,
    correlationId: string,
  ): Promise<LoadReconciliationResult> {
    const accounts = input.accounts.map((accountDto) => {
      const incidents = (accountDto.incidents ?? []).map(
        (incidentDto) =>
          new AccountIncident(
            incidentDto.id,
            accountDto.id,
            incidentDto.type,
            incidentDto.description,
            incidentDto.amount,
          ),
      );

      return new Account(
        accountDto.id,
        accountDto.name,
        accountDto.ledgerBalance,
        accountDto.systemBalance,
        incidents,
      );
    });

    const reconciliation = new Reconciliation(
      randomUUID(),
      input.source,
      new Date(),
      accounts,
    );

    await this.reconciliationRepository.create(reconciliation);

    return {
      reconciliationId: reconciliation.id,
      source: reconciliation.source,
      totalAccounts: reconciliation.totalAccounts,
      totalDifference: reconciliation.totalDifference,
      totalIncidents: reconciliation.totalIncidents,
    };
  }
}
