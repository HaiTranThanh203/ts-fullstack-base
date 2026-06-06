import { type IRefreshTokenRepository, REFRESH_TOKEN_REPOSITORY } from '@/domain/repositories/refresh-token.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  // Logout thiết bị hiện tại — revoke refresh token đang dùng
  async execute(rawRefreshToken: string): Promise<void> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');
    await this.refreshTokenRepository.revokeByTokenHash(tokenHash);
  }

  // Logout tất cả thiết bị — revoke toàn bộ refresh token của user
  async executeAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllByUserId(userId);
  }
}