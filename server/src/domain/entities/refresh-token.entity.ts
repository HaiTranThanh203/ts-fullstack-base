export class RefreshToken {
  constructor(
    public readonly id: string,
    public readonly tokenHash: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
    public readonly isRevoked: boolean,
    public readonly createdAt: Date,
  ) {}

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isRevoked && !this.isExpired();
  }

  revoke(): RefreshToken {
    return new RefreshToken(
      this.id,
      this.tokenHash,
      this.userId,
      this.expiresAt,
      true,
      this.createdAt,
    );
  }
}