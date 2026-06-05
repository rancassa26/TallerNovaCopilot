import { Role } from './role.enum';

/**
 * User Entity - Represents authenticated user
 * Domain entity with no framework dependencies
 */
export class User {
  constructor(
    public id: string,
    public email: string,
    public password: string,
    public roles: Role[],
  ) {}

  hasRole(role: Role): boolean {
    return this.roles.includes(role);
  }

  hasAnyRole(roles: Role[]): boolean {
    return roles.some((role) => this.roles.includes(role));
  }
}
