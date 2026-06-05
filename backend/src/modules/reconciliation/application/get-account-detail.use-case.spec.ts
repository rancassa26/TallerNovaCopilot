import { GetAccountDetailUseCase } from './get-account-detail.use-case';
import { InMemoryReconciliationRepository } from '../infrastructure/in-memory-reconciliation.repository';
import { Reconciliation } from '../domain/reconciliation.entity';
import { Account } from '../domain/account.entity';
import { NotFoundException } from '../../../common/exceptions/base.exception';

describe('GetAccountDetailUseCase', () => {
  let repository: InMemoryReconciliationRepository;
  let useCase: GetAccountDetailUseCase;

  beforeEach(() => {
    repository = new InMemoryReconciliationRepository();
    useCase = new GetAccountDetailUseCase(repository);
  });

  it('should return the requested account when it exists', async () => {
    const reconciliation = new Reconciliation('R1', 'file.json', new Date(), [
      new Account('A1', 'Cash', 1000, 1000, []),
    ]);
    await repository.create(reconciliation);

    const result = await useCase.execute('A1', 'corr-1');

    expect(result).toBeDefined();
    expect(result.id).toBe('A1');
    expect(result.name).toBe('Cash');
  });

  it('should throw NotFoundException when the account does not exist', async () => {
    await expect(useCase.execute('UNKNOWN', 'corr-2')).rejects.toThrow(NotFoundException);
  });
});
