import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { Response } from 'express';
import { ApiResponseDto, PaginationMeta } from '../response/api-response.dto';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { FindAllUsersResult } from '../../application/use-cases/find-all-users.use-case';

function isPaginatedResult(data: unknown): data is FindAllUsersResult {
  return (
    data !== null &&
    typeof data === 'object' &&
    'data' in data &&
    'total' in data &&
    'page' in data &&
    'limit' in data
  );
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'OK';

   return next.handle().pipe(
  map((result) => {
    const statusCode = response.statusCode;

    // 204 No Content — không wrap gì cả
    if (statusCode === HttpStatus.NO_CONTENT || result === undefined || result === null) {
      return result;
    }

    if (isPaginatedResult(result)) {
      const pagination = PaginationMeta.create(
        result.total,
        result.page,
        result.limit,
      );
      return ApiResponseDto.paginated(result.data, pagination, message, statusCode);
    }

    return ApiResponseDto.success(result, message, statusCode);
  }),
);
  }
}