import { AuthService } from './auth.service';
import { User } from '../domain/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let jwtTokenService: any;

  beforeEach(() => {
    userRepository = {
      findByEmail: jasmine.createSpy('findByEmail'),
      findById: jasmine.createSpy('findById'),
    };
    jwtTokenService = {
      generateToken: jasmine.createSpy('generateToken').and.resolveTo('token-123'),
    };
    service = new AuthService(userRepository, jwtTokenService);
  });

  it('should return token and user on valid login', async () => {
    const user: User = {
      id: 'u1',
      email: 'admin@example.com',
      password: 'secret',
      roles: ['ADMIN'],
    };
    userRepository.findByEmail.and.resolveTo(user);

    const result = await service.login('admin@example.com', 'secret', 'corr-1');

    expect(result.token).toBe('token-123');
    expect(result.user).toEqual({ id: 'u1', email: 'admin@example.com', roles: ['ADMIN'] });
    expect(jwtTokenService.generateToken).toHaveBeenCalledWith({
      sub: 'u1',
      email: 'admin@example.com',
      roles: ['ADMIN'],
    });
  });

  it('should throw when email does not exist', async () => {
    userRepository.findByEmail.and.resolveTo(null);

    await expect(service.login('missing@example.com', 'secret', 'corr-2')).rejects.toThrow();
  });

  it('should throw when password is invalid', async () => {
    const user: User = {
      id: 'u2',
      email: 'viewer@example.com',
      password: 'password',
      roles: ['VIEWER'],
    };
    userRepository.findByEmail.and.resolveTo(user);

    await expect(service.login('viewer@example.com', 'wrong', 'corr-3')).rejects.toThrow();
  });

  it('should return user on validateUser when available', async () => {
    const user: User = {
      id: 'u3',
      email: 'user@example.com',
      password: 'abc123',
      roles: ['VIEWER'],
    };
    userRepository.findById.and.resolveTo(user);

    const result = await service.validateUser('u3', 'corr-4');

    expect(result).toEqual(user);
  });

  it('should throw when validateUser cannot find the user', async () => {
    userRepository.findById.and.resolveTo(null);

    await expect(service.validateUser('unknown', 'corr-5')).rejects.toThrow();
  });
});
