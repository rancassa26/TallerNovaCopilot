export enum UserRole {
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
}

export interface UserPayload {
  sub: string;
  username: string;
  role: UserRole;
}