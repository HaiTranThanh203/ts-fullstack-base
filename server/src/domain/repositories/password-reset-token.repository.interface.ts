import { PasswordResetToken } from '../entities/password-reset-token.entity';

export interface IPasswordResetTokenRepository {
  create(data: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken>;
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
  findByUserId(userId: string): Promise<PasswordResetToken | null>;
  revokeByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

export const PASSWORD_RESET_TOKEN_REPOSITORY = Symbol('IPasswordResetTokenRepository');
