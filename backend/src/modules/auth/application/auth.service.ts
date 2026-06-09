import { Injectable, Inject } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { IUserRepository } from '../domain/user.repository.interface';
import { IJwtTokenService } from './jwt-token.service.interface';
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
