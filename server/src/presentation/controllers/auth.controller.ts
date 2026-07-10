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
import { RegisterUseCase } from '@/application/auth/use-cases/register.use-case';
import { ForgotPasswordUseCase } from '@/application/auth/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '@/application/auth/use-cases/reset-password.use-case';
import { ChangePasswordUseCase } from '@/application/auth/use-cases/change-password.use-case';
import { LoginDto } from '@/application/auth/dtos/login.dto';
import { RefreshTokenDto } from '@/application/auth/dtos/refresh-token.dto';
import { RegisterDto } from '@/application/auth/dtos/register.dto';
import { ForgotPasswordDto } from '@/application/auth/dtos/forgot-password.dto';
import { ResetPasswordDto } from '@/application/auth/dtos/reset-password.dto';
import { ChangePasswordDto } from '@/application/auth/dtos/change-password.dto';
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
    private readonly registerUseCase: RegisterUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Registration successful')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới, nhận access token và refresh token' })
  @ApiSuccessResponse(AuthResponseDto, 201, 'Registration successful')
  @ApiErrorResponse(409, 'Email đã tồn tại', 'UserAlreadyExistsException', 'User with email "x@x.com" already exists')
  @ApiErrorResponse(400, 'Validation lỗi', 'BadRequestException', 'email must be an email')
  register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

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

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Password reset email sent')
  @ApiOperation({ summary: 'Gửi email reset password' })
  @ApiErrorResponse(400, 'Validation lỗi', 'BadRequestException', 'email must be an email')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute(dto);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Password reset successfully')
  @ApiOperation({ summary: 'Reset password với token từ email' })
  @ApiErrorResponse(400, 'Token không hợp lệ', 'InvalidPasswordResetTokenException', 'Invalid password reset token')
  @ApiErrorResponse(400, 'Token hết hạn', 'PasswordResetTokenExpiredException', 'Password reset token has expired')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute(dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ResponseMessage('Password changed successfully')
  @ApiOperation({ summary: 'Đổi mật khẩu (yêu cầu đăng nhập)' })
  @ApiErrorResponse(400, 'Mật khẩu hiện tại không đúng', 'InvalidCurrentPasswordException', 'Current password is incorrect')
  @ApiErrorResponse(400, 'Mật khẩu mới trùng với mật khẩu cũ', 'SamePasswordException', 'New password must be different from current password')
  changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: User) {
    return this.changePasswordUseCase.execute(dto, user);
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