import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { type IUserRepository, USER_REPOSITORY } from '@/domain/repositories/user.repository.interface';
import { type IPasswordResetTokenRepository, PASSWORD_RESET_TOKEN_REPOSITORY } from '@/domain/repositories/password-reset-token.repository.interface';
import { EmailService } from '@/infrastructure/services/email.service';

export interface ForgotPasswordResponse {
  message: string;
}

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    // 1. Find user by email (if not found, still return success to prevent user enumeration)
    const user = await this.userRepository.findByEmail(dto.email);

    if (user) {
      // 2. Revoke any existing reset tokens for this user
      await this.passwordResetTokenRepository.revokeByUserId(user.id);

      // 3. Generate reset token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      // 4. Calculate expiry
      const expiresInMs = this.parseExpiry(
        this.configService.getOrThrow<string>('PASSWORD_RESET_TOKEN_EXPIRES'),
      );
      const expiresAt = new Date(Date.now() + expiresInMs);

      // 5. Save token to database
      await this.passwordResetTokenRepository.create({
        tokenHash,
        userId: user.id,
        expiresAt,
      });

      // 6. Build reset URL
      const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
      const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

      // 7. Send email
      await this.emailService.sendPasswordResetEmail(user.email, resetUrl);
    }

    // 8. Always return success to prevent user enumeration
    return { message: 'If an account exists with this email, a password reset link has been sent' };
  }

  private parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * (units[unit] ?? 1000);
  }
}
