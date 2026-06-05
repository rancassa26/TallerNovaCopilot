import { Injectable } from '@nestjs/common';

/**
 * LoggerService - Structured JSON logging with correlation ID support
 */
@Injectable()
export class LoggerService {
  private context: string = 'TallerNova';

  setContext(context: string) {
    this.context = context;
  }

  private formatLog(
    level: string,
    message: string,
    correlationId?: string,
    metadata?: any,
  ): string {
    const logObj = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      correlationId,
      ...metadata,
    };
    return JSON.stringify(logObj);
  }

  log(message: string, correlationId?: string, metadata?: any) {
    console.log(this.formatLog('INFO', message, correlationId, metadata));
  }

  error(message: string, correlationId?: string, metadata?: any) {
    console.error(this.formatLog('ERROR', message, correlationId, metadata));
  }

  warn(message: string, correlationId?: string, metadata?: any) {
    console.warn(this.formatLog('WARN', message, correlationId, metadata));
  }

  debug(message: string, correlationId?: string, metadata?: any) {
    console.debug(this.formatLog('DEBUG', message, correlationId, metadata));
  }
}
