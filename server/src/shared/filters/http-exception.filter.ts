import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponseDto } from '../response/api-response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Lấy message từ ValidationPipe (trả về mảng) hoặc string thông thường
    const message =
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
        ? Array.isArray((exceptionResponse as any).message)
          ? (exceptionResponse as any).message.join(', ')
          : (exceptionResponse as any).message
        : exception.message;

    response
      .status(status)
      .json(ApiResponseDto.error(message, status, exception.constructor.name));
  }
}