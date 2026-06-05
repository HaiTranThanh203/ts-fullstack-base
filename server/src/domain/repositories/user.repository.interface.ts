import { User } from '../entities/user.entity';

export interface FindAllOptions {
  page?: number;
  limit?: number;
  role?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(options?: FindAllOptions): Promise<{ data: User[]; total: number }>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDeleted' | 'isAdmin' | 'update' | 'softDelete'>): Promise<User>;
  update(id: string, data: Partial<Pick<User, 'name' | 'email'>>): Promise<User | null>;
  softDelete(id: string): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}

// Dùng Symbol làm injection token để tránh conflict tên
export const USER_REPOSITORY = Symbol('IUserRepository');