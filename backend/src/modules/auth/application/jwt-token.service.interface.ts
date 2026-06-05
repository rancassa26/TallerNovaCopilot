/**
 * IJwtTokenService - Abstracts JWT operations (to be implemented in infrastructure layer)
 */
export interface IJwtTokenService {
  generateToken(payload: {
    sub: string;
    email: string;
    roles: string[];
  }): Promise<string>;

  verifyToken(token: string): Promise<any>;
}

export const JWT_TOKEN_SERVICE_TOKEN = Symbol('IJwtTokenService');
