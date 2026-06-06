import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';


import { AuthResponseDto } from '../dtos/auth-response.dto';
import { type IUserRepository, USER_REPOSITORY } from '@/domain/repositories/user.repository.interface';
import { type IRefreshTokenRepository, REFRESH_TOKEN_REPOSITORY } from '@/domain/repositories/refresh-token.repository.interface';
import { InvalidCredentialsException } from '@/domain/exceptions/auth.exception';
import { LoginDto } from '../dtos/login.dto';
import { UserMapper } from '@/application/user/mappers/user.mapper';


@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    // 1. Tìm user theo email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // 2. Kiểm tra password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // 3. Kiểm tra user không bị xóa
    if (user.isDeleted()) {
      throw new InvalidCredentialsException();
    }

    // 4. Tạo JWT payload
    const payload = { sub: user.id, email: user.email, role: user.role };

    // 5. Ký access token
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES') as any ,
    });

    // 6. Tạo refresh token raw string
    const rawRefreshToken = crypto.randomBytes(64).toString('hex');

    // 7. Hash refresh token trước khi lưu DB
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    // 8. Tính thời gian hết hạn refresh token
    const expiresInMs = this.parseExpiry(
      this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES'),
    );
    const expiresAt = new Date(Date.now() + expiresInMs);

    // 9. Lưu refresh token vào DB
    await this.refreshTokenRepository.create({
      tokenHash,
      userId: user.id,
      expiresAt,
    });

    return {
      user: UserMapper.toResponse(user),
      accessToken,
      refreshToken: rawRefreshToken,
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