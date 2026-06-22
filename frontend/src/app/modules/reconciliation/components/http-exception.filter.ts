import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from '../logger/logger.service';

/**
 * GlobalExceptionFilter - Intercepta todas las excepciones de la aplicación.
 * Transforma los errores en una respuesta JSON estandarizada e incluye el Correlation ID.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<any>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const correlationId = request.correlationId;

    const errorBody = {
      success: false,
      status,
      message: typeof exceptionResponse === 'object' ? (exceptionResponse as any).message : exceptionResponse,
      error: exception instanceof Error ? exception.name : 'Error',
      path: request.url,
      timestamp: new Date().toISOString(),
      correlationId,
    };

    // Registro estructurado del error. 
    // El LoggerService propagará los campos del objeto al JSON final.
    this.logger.error(errorBody, exception instanceof Error ? exception.stack : undefined, 'GlobalExceptionFilter');

    response.status(status).json(errorBody);
  }
}