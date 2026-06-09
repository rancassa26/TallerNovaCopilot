import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { randomUUID } from 'crypto';

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
    return randomUUID();
  }
}
