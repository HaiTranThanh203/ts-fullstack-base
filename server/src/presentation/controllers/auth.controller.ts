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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponse, ApiSuccessResponse } from '@/shared/swagger/api-response.swagger';
import { AuthResponseDto } from '@/application/auth/dtos/auth-response.dto';
import { UserResponseDto } from '@/application/user/dtos/user-response.dto';

@ApiTags('Auth')
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
  @ApiOperation({ summary: 'Đăng nhập, nhận access token và refresh token' })
  @ApiSuccessResponse(AuthResponseDto, 200, 'Login successful')
  @ApiErrorResponse(401, 'Sai email hoặc password', 'InvalidCredentialsException', 'Email or password is incorrect')
  @ApiErrorResponse(400, 'Validation lỗi', 'BadRequestException', 'email must be an email')
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Token refreshed successfully')
  @ApiOperation({ summary: 'Đổi refresh token lấy cặp token mới' })
  @ApiSuccessResponse(AuthResponseDto, 200, 'Token refreshed')
  @ApiErrorResponse(401, 'Token không hợp lệ hoặc hết hạn', 'InvalidRefreshTokenException', 'Refresh token is invalid or expired')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ResponseMessage('Logout successful')
  @ApiOperation({ summary: 'Đăng xuất thiết bị hiện tại' })
  @ApiErrorResponse(401, 'Chưa đăng nhập', 'UnauthorizedException', 'Access token is missing or invalid')
  logout(
    @Body() dto: RefreshTokenDto,
    @CurrentUser() user: User,
  ) {
    return this.logoutUseCase.execute(dto.refreshToken);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ResponseMessage('Logged out from all devices')
  @ApiOperation({ summary: 'Đăng xuất tất cả thiết bị' })
  logoutAll(@CurrentUser() user: User) {
    return this.logoutUseCase.executeAll(user.id);
  }

  @Get('me')
  @ResponseMessage('Profile retrieved successfully')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy thông tin user đang đăng nhập' })
  @ApiSuccessResponse(UserResponseDto, 200, 'Profile retrieved')
  @ApiErrorResponse(401, 'Chưa đăng nhập', 'UnauthorizedException', 'Access token is missing or invalid')
  me(@CurrentUser() user: User) {
    return UserMapper.toResponse(user);
  }
}