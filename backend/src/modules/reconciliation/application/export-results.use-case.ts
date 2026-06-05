import { Injectable, Inject } from '@nestjs/common';
import { IReconciliationRepository } from '../domain/reconciliation.repository.interface';
import { NotFoundException, ValidationException } from '../../../common/exceptions/base.exception';

export type ExportFormat = 'json' | 'csv';

export interface ExportResult {
  filename: string;
  format: ExportFormat;
  content: string;
}

@Injectable()
export class ExportResultsUseCase {
  constructor(
    @Inject('IReconciliationRepository')
    private readonly reconciliationRepository: IReconciliationRepository,
  ) {}

  async execute(
    reconciliationId: string | null,
    format: string,
    correlationId: string,
  ): Promise<ExportResult> {
    const normalizedFormat = (format ?? 'json').toLowerCase();

    if (normalizedFormat !== 'json' && normalizedFormat !== 'csv') {
      throw new ValidationException(
        `Format must be either 'json' or 'csv'`,
        correlationId,
      );
    }

    const reconciliations = reconciliationId
      ? await this.loadSingleReconciliation(reconciliationId, correlationId)
      : await this.reconciliationRepository.findAll();

    const payload = reconciliations.map((reconciliation) => ({
      id: reconciliation.id,
      source: reconciliation.source,
      loadedAt: reconciliation.loadedAt.toISOString(),
      totalAccounts: reconciliation.totalAccounts,
      totalDifference: reconciliation.totalDifference,
      totalIncidents: reconciliation.totalIncidents,
      accounts: reconciliation.accounts.map((account) => ({
        id: account.id,
        name: account.name,
        ledgerBalance: account.ledgerBalance,
        systemBalance: account.systemBalance,
        difference: account.difference,
        incidents: account.incidents.map((incident) => ({
          id: incident.id,
          type: incident.type,
          description: incident.description,
          amount: incident.amount,
        })),
      })),
    }));

    const filename = reconciliationId
      ? `reconciliation-${reconciliationId}-export.${normalizedFormat}`
      : `reconciliations-export.${normalizedFormat}`;

    const content =
      normalizedFormat === 'json'
        ? JSON.stringify(payload, null, 2)
        : this.toCsv(payload);

    return {
      filename,
      format: normalizedFormat as ExportFormat,
      content,
    };
  }

  private async loadSingleReconciliation(
    reconciliationId: string,
    correlationId: string,
  ) {
    const reconciliation = await this.reconciliationRepository.findById(reconciliationId);

    if (!reconciliation) {
      throw new NotFoundException(`Reconciliation ${reconciliationId} not found`, correlationId);
    }

    return [reconciliation];
  }

  private toCsv(payload: Array<any>): string {
    const rows: string[] = [];
    rows.push(
      'reconciliationId,source,loadedAt,accountId,accountName,ledgerBalance,systemBalance,difference,incidentCount,incidentId,incidentType,incidentDescription,incidentAmount',
    );

    for (const reconciliation of payload) {
      for (const account of reconciliation.accounts) {
        if (account.incidents.length === 0) {
          rows.push(
            `${this.escape(reconciliation.id)},${this.escape(reconciliation.source)},${this.escape(
              reconciliation.loadedAt,
            )},${this.escape(account.id)},${this.escape(account.name)},${account.ledgerBalance},${account.systemBalance},${account.difference},${account.incidents.length},,,`,
          );
          continue;
        }

        for (const incident of account.incidents) {
          rows.push(
            `${this.escape(reconciliation.id)},${this.escape(reconciliation.source)},${this.escape(
              reconciliation.loadedAt,
            )},${this.escape(account.id)},${this.escape(account.name)},${account.ledgerBalance},${account.systemBalance},${account.difference},${account.incidents.length},${this.escape(
              incident.id,
            )},${this.escape(incident.type)},${this.escape(
              incident.description,
            )},${incident.amount}`,
          );
        }
      }
    }

    return rows.join('\n');
  }

  private escape(value: string | number): string {
    const raw = String(value ?? '');
    if (raw.includes(',') || raw.includes('"') || raw.includes('\n')) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  }
}
