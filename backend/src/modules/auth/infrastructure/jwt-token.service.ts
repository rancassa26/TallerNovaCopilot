import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJwtTokenService } from '../application/jwt-token.service.interface';

/**
 * JwtTokenService - Infrastructure layer implementation of JWT operations
 */
@Injectable()
export class JwtTokenService implements IJwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: {
    sub: string;
    email: string;
    roles: string[];
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: (process.env.JWT_EXPIRATION ?? '24h') as any,
    });
  }

  async verifyToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
    });
  }
}
