import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BaseException } from '../exceptions/base.exception';

/**
 * RolesGuard - Validates that user has required roles
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = () =>
      requiredRoles.some((role) => user.roles?.includes(role));

    if (!hasRole()) {
      throw new BaseException(
        'Insufficient permissions',
        403,
        'AUTH_403_FORBIDDEN',
        request.correlationId,
      );
    }

    return true;
  }
}
