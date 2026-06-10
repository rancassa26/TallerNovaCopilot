import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { LoggerStorage } from './logger.storage';

/**
 * LoggerService - Implementación de logging estructurado JSON para NestJS.
 * Recupera automáticamente el correlationId del contexto de ejecución.
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private context = 'TallerNova-Backend';

  log(message: any, context?: string) {
    this.printLog('INFO', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.printLog('ERROR', message, context, { trace });
  }

  warn(message: any, context?: string) {
    this.printLog('WARN', message, context);
  }

  debug(message: any, context?: string) {
    this.printLog('DEBUG', message, context);
  }

  private printLog(level: string, message: any, context?: string, extra?: any) {
    const store = LoggerStorage.getStore();
    const correlationId = store?.get('correlationId');

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: context || this.context,
      message: typeof message === 'object' ? message.message : message,
      correlationId,
      ...(typeof message === 'object' ? message : {}),
      ...extra,
    };

    if (level === 'ERROR') {
      console.error(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }
}