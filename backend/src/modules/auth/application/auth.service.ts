import { Injectable, Inject } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { IUserRepository } from '../domain/user.repository.interface';
import { IJwtTokenService } from './jwt-token.service.interface';
import { LoggerService } from '../../common/logger/logger.service';
import { AuditUseCase } from '../presentation/audit.use-case';
import {
  InvalidCredentialsException,
  UserNotFoundException,
} from '../domain/auth.exceptions';

/**
 * AuthService - Application layer service
 * Orchestrates authentication use cases without framework dependencies
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository') private userRepository: IUserRepository,
    @Inject('IJwtTokenService') private jwtTokenService: IJwtTokenService,
    private readonly auditUseCase: AuditUseCase,
    private readonly logger: LoggerService,
  ) {}

  async login(
    email: string,
    password: string,
    correlationId: string,
  ): Promise<{ token: string; user: { id: string; email: string; roles: string[] } }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundException(email, correlationId);
    }

    // Validate password (in production, should use bcrypt)
    if (user.password !== password) {
      throw new InvalidCredentialsException(correlationId);
    }

    // Generate JWT token
    const token = await this.jwtTokenService.generateToken({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });

    // Registrar auditoría de inicio de sesión exitoso
    await this.auditUseCase.execute(
      user.id,
      'LOGIN_SUCCESS',
      { email: user.email },
      correlationId
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  async refreshToken(
    userId: string,
    correlationId: string,
  ): Promise<{ token: string; user: { id: string; email: string; roles: string[] } }> {
    this.logger.log(`Refreshing token for user ID: ${userId}`, correlationId);

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException(userId, correlationId);
    }

    // Generate new JWT token
    const token = await this.jwtTokenService.generateToken({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  async validateUser(userId: string, correlationId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException(userId, correlationId);
    }

    return user;
  }
}
