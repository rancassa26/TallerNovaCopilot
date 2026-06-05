import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'crypto';

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

    return next.handle();
  }

  private generateId(): string {
    // Simple UUID generation (without crypto dependency)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
