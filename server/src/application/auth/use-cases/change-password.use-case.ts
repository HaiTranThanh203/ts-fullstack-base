import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { ChangePasswordDto } from '../dtos/change-password.dto';
import { type IUserRepository, USER_REPOSITORY } from '@/domain/repositories/user.repository.interface';
import { type IRefreshTokenRepository, REFRESH_TOKEN_REPOSITORY } from '@/domain/repositories/refresh-token.repository.interface';
import { User } from '@/domain/entities/user.entity';
import {
  InvalidCurrentPasswordException,
  SamePasswordException,
} from '@/domain/exceptions/auth.exception';

export interface ChangePasswordResponse {
  message: string;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(dto: ChangePasswordDto, currentUser: User): Promise<ChangePasswordResponse> {
    // 1. Find the user
    const user = await this.userRepository.findById(currentUser.id);
    if (!user) {
      throw new InvalidCurrentPasswordException();
    }

    // 2. Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new InvalidCurrentPasswordException();
    }

    // 3. Check if new password is different from current
    const isSamePassword = await bcrypt.compare(dto.newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new SamePasswordException();
    }

    // 4. Hash new password
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // 5. Update user password
    await this.userRepository.updatePassword(user.id, newPasswordHash);

    // 6. Revoke all refresh tokens (force re-login with new password)
    await this.refreshTokenRepository.revokeAllByUserId(user.id);

    return { message: 'Password changed successfully. Please login again with your new password.' };
  }
}
