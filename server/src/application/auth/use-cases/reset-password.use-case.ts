import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { type IUserRepository, USER_REPOSITORY } from '@/domain/repositories/user.repository.interface';
import { type IPasswordResetTokenRepository, PASSWORD_RESET_TOKEN_REPOSITORY } from '@/domain/repositories/password-reset-token.repository.interface';
import { type IRefreshTokenRepository, REFRESH_TOKEN_REPOSITORY } from '@/domain/repositories/refresh-token.repository.interface';
import {
  InvalidPasswordResetTokenException,
  PasswordResetTokenExpiredException,
} from '@/domain/exceptions/auth.exception';
import { UserNotFoundException } from '@/domain/exceptions/user.exception';

export interface ResetPasswordResponse {
  message: string;
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<ResetPasswordResponse> {
    // 1. Hash the token from request
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');

    // 2. Find the token in database
    const resetToken = await this.passwordResetTokenRepository.findByTokenHash(tokenHash);

    if (!resetToken) {
      throw new InvalidPasswordResetTokenException();
    }

    // 3. Check if token is expired
    if (resetToken.isExpired()) {
      throw new PasswordResetTokenExpiredException();
    }

    // 4. Find the user
    const user = await this.userRepository.findById(resetToken.userId);
    if (!user) {
      throw new UserNotFoundException(resetToken.userId);
    }

    // 5. Hash new password
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // 6. Update user password
    await this.userRepository.updatePassword(resetToken.userId, newPasswordHash);

    // 7. Revoke all refresh tokens for this user (force re-login)
    await this.refreshTokenRepository.revokeAllByUserId(resetToken.userId);

    // 8. Delete the reset token
    await this.passwordResetTokenRepository.revokeByUserId(resetToken.userId);

    return { message: 'Password has been reset successfully. Please login with your new password.' };
  }
}
