import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { TokenPairDto } from '../dtos/auth-response.dto';
import { type IUserRepository, USER_REPOSITORY } from '@/domain/repositories/user.repository.interface';
import { type IRefreshTokenRepository, REFRESH_TOKEN_REPOSITORY } from '@/domain/repositories/refresh-token.repository.interface';
import { InvalidRefreshTokenException } from '@/domain/exceptions/auth.exception';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(rawRefreshToken: string): Promise<TokenPairDto> {
    // 1. Hash token nhận được để so sánh với DB
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    // 2. Tìm trong DB
    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken || !storedToken.isValid()) {
      throw new InvalidRefreshTokenException();
    }

    // 3. Lấy user
    const user = await this.userRepository.findById(storedToken.userId);
    if (!user || user.isDeleted()) {
      throw new InvalidRefreshTokenException();
    }

    // 4. Revoke token cũ ngay lập tức — Token Rotation
    await this.refreshTokenRepository.revokeByTokenHash(tokenHash);

    // 5. Ký access token mới
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES') as any ,
    });

    // 6. Tạo refresh token mới
    const newRawRefreshToken = crypto.randomBytes(64).toString('hex');
    const newTokenHash = crypto
      .createHash('sha256')
      .update(newRawRefreshToken)
      .digest('hex');

    const expiresInMs = this.parseExpiry(
      this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES'),
    );
    const expiresAt = new Date(Date.now() + expiresInMs);

    await this.refreshTokenRepository.create({
      tokenHash: newTokenHash,
      userId: user.id,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
    };
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