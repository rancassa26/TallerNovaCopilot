/**
 * BaseException - Base exception class with statusCode, errorCode, and correlationId
 */
export class BaseException extends Error {
  statusCode: number;
  errorCode: string;
  correlationId: string;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    correlationId: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.correlationId = correlationId;
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message: string, correlationId: string) {
    super(message, 401, 'AUTH_401', correlationId);
  }
}

export class ForbiddenException extends BaseException {
  constructor(message: string, correlationId: string) {
    super(message, 403, 'AUTH_403', correlationId);
  }
}

export class ValidationException extends BaseException {
  constructor(message: string, correlationId: string) {
    super(message, 400, 'VALIDATION_400', correlationId);
  }
}

export class NotFoundException extends BaseException {
  constructor(message: string, correlationId: string) {
    super(message, 404, 'NOT_FOUND_404', correlationId);
  }
}

export class InternalServerException extends BaseException {
  constructor(message: string, correlationId: string) {
    super(message, 500, 'INTERNAL_SERVER_500', correlationId);
  }
}
