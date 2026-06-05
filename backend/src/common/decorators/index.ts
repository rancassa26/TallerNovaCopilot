import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @CorrelationId() - Injects the correlation ID into the handler
 */
export const CorrelationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.correlationId;
  },
);

/**
 * @Public() - Marks a route as public (no JWT required)
 */
export const Public = () => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('isPublic', true, descriptor?.value || target);
  };
};

/**
 * @Roles() - Requires specific roles to access the endpoint
 */
export const Roles = (...roles: string[]) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('roles', roles, descriptor?.value || target);
  };
};
