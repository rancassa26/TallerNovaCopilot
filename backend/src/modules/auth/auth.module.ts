import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './application/auth.service';
import { AuthController } from './presentation/auth.controller';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { JwtTokenService } from './infrastructure/jwt-token.service';
import { InMemoryUserRepository } from './infrastructure/in-memory-user.repository';
import { LoggerService } from '../../common/logger/logger.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: (process.env.JWT_EXPIRATION ?? '24h') as any },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtTokenService,
    LoggerService,
    {
      provide: 'IUserRepository',
      useClass: InMemoryUserRepository,
    },
    {
      provide: 'IJwtTokenService',
      useClass: JwtTokenService,
    },
  ],
  exports: [AuthService, JwtTokenService],
})
export class AuthModule {}
