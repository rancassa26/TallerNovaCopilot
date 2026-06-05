import { BaseException } from '../../../common/exceptions/base.exception';

/**
 * Auth-specific domain exceptions
 */
export class InvalidCredentialsException extends BaseException {
  constructor(correlationId: string) {
    super('Invalid email or password', 401, 'AUTH_INVALID_CREDENTIALS', correlationId);
  }
}

export class UserNotFoundException extends BaseException {
  constructor(email: string, correlationId: string) {
    super(`User with email ${email} not found`, 404, 'AUTH_USER_NOT_FOUND', correlationId);
  }
}

export class UserAlreadyExistsException extends BaseException {
  constructor(email: string, correlationId: string) {
    super(`User with email ${email} already exists`, 409, 'AUTH_USER_EXISTS', correlationId);
  }
}
