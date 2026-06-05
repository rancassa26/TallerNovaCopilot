import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { IUserRepository } from '../domain/user.repository.interface';
import { Role } from '../domain/role.enum';

/**
 * InMemoryUserRepository - In-memory implementation of user repository (MVP)
 * Can be replaced with database implementation later
 */
@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  constructor() {
    // Initialize with mock users
    this.seedUsers();
  }

  private seedUsers() {
    const adminUser = new User(
      '1',
      'admin@test.com',
      'password123',
      [Role.ADMIN, Role.VIEWER],
    );
    const viewerUser = new User(
      '2',
      'viewer@test.com',
      'password123',
      [Role.VIEWER],
    );

    this.users.set(adminUser.id, adminUser);
    this.users.set(viewerUser.id, viewerUser);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}
