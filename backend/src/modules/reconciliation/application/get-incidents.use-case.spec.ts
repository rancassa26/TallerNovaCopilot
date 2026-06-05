import { GetIncidentsUseCase } from './get-incidents.use-case';
import { InMemoryReconciliationRepository } from '../infrastructure/in-memory-reconciliation.repository';
import { Reconciliation } from '../domain/reconciliation.entity';
import { Account, AccountIncident } from '../domain/account.entity';
import { NotFoundException } from '../../../common/exceptions/base.exception';

describe('GetIncidentsUseCase', () => {
  let repository: InMemoryReconciliationRepository;
  let useCase: GetIncidentsUseCase;

  beforeEach(() => {
    repository = new InMemoryReconciliationRepository();
    useCase = new GetIncidentsUseCase(repository);
  });

  it('should return all incidents across all reconciliations when no id is provided', async () => {
    const reconciliation = new Reconciliation('R1', 'file.json', new Date(), [
      new Account('A1', 'Cash', 1000, 950, [
        new AccountIncident('I1', 'A1', 'Difference', 'Round-off', 50),
      ]),
    ]);
    await repository.create(reconciliation);

    const result = await useCase.execute();

    expect(result.length).toBe(1);
    expect(result[0].reconciliationId).toBe('all');
    expect(result[0].incidentId).toBe('I1');
  });

  it('should return incidents for a specific reconciliation by id', async () => {
    const reconciliation = new Reconciliation('R2', 'file2.json', new Date(), [
      new Account('A2', 'Bank', 2000, 1950, [
        new AccountIncident('I2', 'A2', 'Adjustment', 'Interest', 50),
      ]),
    ]);
    await repository.create(reconciliation);

    const result = await useCase.execute('R2');

    expect(result.length).toBe(1);
    expect(result[0].reconciliationId).toBe('R2');
    expect(result[0].accountName).toBe('Bank');
  });

  it('should throw NotFoundException when a reconciliation id does not exist', async () => {
    await expect(useCase.execute('UNKNOWN')).rejects.toThrow(NotFoundException);
  });
});
