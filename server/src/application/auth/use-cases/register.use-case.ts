import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { RegisterDto } from '../dtos/register.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { UserMapper } from '@/application/user/mappers/user.mapper';
import { type IUserRepository, USER_REPOSITORY } from '@/domain/repositories/user.repository.interface';
import { type IRefreshTokenRepository, REFRESH_TOKEN_REPOSITORY } from '@/domain/repositories/refresh-token.repository.interface';
import { UserAlreadyExistsException } from '@/domain/exceptions/user.exception';
import { UserRole } from '@/domain/entities/user.entity';
import { EmailService } from '@/infrastructure/services/email.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResponseDto> {
    // 1. Check if user already exists
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) {
      throw new UserAlreadyExistsException(dto.email);
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3. Create user
    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: UserRole.USER,
    });

    // 4. Send welcome email (non-blocking)
    this.emailService.sendWelcomeEmail(user.email, user.name).catch(() => {
      // Log error but don't fail registration
    });

    // 5. Generate tokens
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES') as any,
    });

    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    const expiresInMs = this.parseExpiry(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES'));
    const expiresAt = new Date(Date.now() + expiresInMs);

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
