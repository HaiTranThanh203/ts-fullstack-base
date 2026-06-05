export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null = null,
  ) {}

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  // Trả về instance mới với field được update — giữ immutability
  update(data: Partial<Pick<User, 'name' | 'email'>>): User {
    return new User(
      this.id,
      data.name ?? this.name,
      data.email ?? this.email,
      this.passwordHash,
      this.role,
      this.createdAt,
      new Date(),
      this.deletedAt,
    );
  }

  softDelete(): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.passwordHash,
      this.role,
      this.createdAt,
      this.updatedAt,
      new Date(),
    );
  }
}