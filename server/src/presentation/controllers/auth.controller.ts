import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ResponseMessage } from '../../shared/decorators/response-message.decorator';
import { User } from '../../domain/entities/user.entity';
import { LoginUseCase } from '@/application/auth/use-cases/login.use-case';
import { RefreshTokenUseCase } from '@/application/auth/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '@/application/auth/use-cases/logout.use-case';
import { LoginDto } from '@/application/auth/dtos/login.dto';
import { RefreshTokenDto } from '@/application/auth/dtos/refresh-token.dto';
import { UserMapper } from '@/application/user/mappers/user.mapper';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login successful')
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Token refreshed successfully')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Logout successful')
  logout(
    @Body() dto: RefreshTokenDto,
    @CurrentUser() user: User,
  ) {
    return this.logoutUseCase.execute(dto.refreshToken);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Logged out from all devices')
  logoutAll(@CurrentUser() user: User) {
    return this.logoutUseCase.executeAll(user.id);
  }

  @Get('me')
  @ResponseMessage('Profile retrieved successfully')
  me(@CurrentUser() user: User) {
    return UserMapper.toResponse(user);
  }
}