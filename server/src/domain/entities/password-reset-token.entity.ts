export class PasswordResetToken {
  constructor(
    public readonly id: string,
    public readonly tokenHash: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
  ) {}

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isExpired();
  }
}
