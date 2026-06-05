import { Injectable } from '@angular/core';

/**
 * LoggerService - Structured logging service for frontend
 */
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private context = 'TallerNova-Frontend';

  log(message: string, correlationId?: string, metadata?: any) {
    const logObj = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      context: this.context,
      message,
      correlationId,
      ...metadata,
    };
    console.log(JSON.stringify(logObj));
  }

  error(message: string, correlationId?: string, metadata?: any) {
    const logObj = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      context: this.context,
      message,
      correlationId,
      ...metadata,
    };
    console.error(JSON.stringify(logObj));
  }

  warn(message: string, correlationId?: string, metadata?: any) {
    const logObj = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      context: this.context,
      message,
      correlationId,
      ...metadata,
    };
    console.warn(JSON.stringify(logObj));
  }

  debug(message: string, correlationId?: string, metadata?: any) {
    const logObj = {
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      context: this.context,
      message,
      correlationId,
      ...metadata,
    };
    console.debug(JSON.stringify(logObj));
  }
}
