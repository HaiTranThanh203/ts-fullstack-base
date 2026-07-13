import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  UserNotFoundException,
  UserAlreadyExistsException,
  UserDeletedException,
} from '../../domain/exceptions/user.exception';
import {
  InvalidCredentialsException,
  InvalidRefreshTokenException,
  UnauthorizedException,
  PasswordResetTokenExpiredException,
  InvalidPasswordResetTokenException,
  InvalidCurrentPasswordException,
  SamePasswordException,
} from '../../domain/exceptions/auth.exception';
import { ApiResponseDto } from '../response/api-response.dto';

@Catch(
  UserNotFoundException,
  UserAlreadyExistsException,
  UserDeletedException,
  InvalidCredentialsException,
  InvalidRefreshTokenException,
  UnauthorizedException,
  PasswordResetTokenExpiredException,
  InvalidPasswordResetTokenException,
  InvalidCurrentPasswordException,
  SamePasswordException,
)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly statusMap = new Map<string, HttpStatus>([
    ['UserNotFoundException', HttpStatus.NOT_FOUND],
    ['UserAlreadyExistsException', HttpStatus.CONFLICT],
    ['UserDeletedException', HttpStatus.GONE],
    ['InvalidCredentialsException', HttpStatus.UNAUTHORIZED],
    ['InvalidRefreshTokenException', HttpStatus.UNAUTHORIZED],
    ['UnauthorizedException', HttpStatus.UNAUTHORIZED],
    ['PasswordResetTokenExpiredException', HttpStatus.BAD_REQUEST],
    ['InvalidPasswordResetTokenException', HttpStatus.BAD_REQUEST],
    ['InvalidCurrentPasswordException', HttpStatus.BAD_REQUEST],
    ['SamePasswordException', HttpStatus.BAD_REQUEST],
  ]);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      this.statusMap.get(exception.name) ?? HttpStatus.INTERNAL_SERVER_ERROR;

    response
      .status(status)
      .json(ApiResponseDto.error(exception.message, status, exception.name));
  }
}