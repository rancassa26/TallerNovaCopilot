import { User } from './user.entity';

/**
 * IUserRepository - Repository interface for User persistence
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY_TOKEN = Symbol('IUserRepository');
