import {
  Catch,
  ExceptionFilter,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseException } from '../exceptions/base.exception';
import { BaseResponseDTO } from '../dtos/base-response.dto';
import { LoggerService } from '../logger/logger.service';

/**
 * GlobalExceptionFilter - Catches all exceptions and formats as BaseResponseDTO
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ExecutionContext) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const correlationId = request.correlationId || 'unknown';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_500';
    let message = 'Internal Server Error';
    let error = '';

    if (exception instanceof BaseException) {
      statusCode = exception.statusCode;
      errorCode = exception.errorCode;
      message = exception.message;
      error = exception.message;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exResponse = exception.getResponse();
      message =
        typeof exResponse === 'object' && 'message' in exResponse
          ? (exResponse as any).message
          : exception.message;
      error = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.message;
    }

    this.logger.error(
      `Exception caught: ${message}`,
      correlationId,
      {
        errorCode,
        statusCode,
        error,
      },
    );

    const errorResponse = BaseResponseDTO.error(
      message,
      correlationId,
      statusCode,
      errorCode,
      error,
    );

    response.status(statusCode).json(errorResponse);
  }
}
