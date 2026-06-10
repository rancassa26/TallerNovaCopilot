import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { randomUUID } from 'crypto';
import { LoggerStorage } from '../logger/logger.storage';

/**
 * CorrelationIdInterceptor - Generates or extracts correlation ID for all requests
 */
@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Use existing correlation ID from header or generate new one
    const correlationId = request.headers['x-correlation-id'] || this.generateId();
    request.correlationId = correlationId;

    // Envolvemos la ejecución en el almacenamiento asíncrono
    const store = new Map().set('correlationId', correlationId);
    return new Observable((observer) => {
      LoggerStorage.run(store, () => {
        next.handle().subscribe(observer);
      });
    });
  }

  private generateId(): string {
    return randomUUID();
  }
}
