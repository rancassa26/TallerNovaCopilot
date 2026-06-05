import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponseDTO } from '../dtos/base-response.dto';

/**
 * ResponseInterceptor - Wraps all successful responses in BaseResponseDTO
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const correlationId = request.correlationId;

    return next.handle().pipe(
      map((data) => {
        // If already a BaseResponseDTO, return as-is
        if (data instanceof BaseResponseDTO) {
          return data;
        }

        // Otherwise wrap in BaseResponseDTO
        return BaseResponseDTO.success(
          'Request successful',
          data,
          correlationId,
          200,
        );
      }),
    );
  }
}
