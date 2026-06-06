import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

// Single object response
export function ApiSuccessResponse<T extends Type>(
  model: T,
  statusCode = 200,
  description = 'Success',
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: statusCode,
      description,
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'number', example: statusCode },
          message: { type: 'string', example: 'OK' },
          data: { $ref: getSchemaPath(model) },
        },
      },
    }),
  );
}

// Paginated list response
export function ApiPaginatedResponse<T extends Type>(
  model: T,
  description = 'Paginated list',
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: 200,
      description,
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'OK' },
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
          pagination: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 20 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              totalPages: { type: 'number', example: 2 },
              hasNextPage: { type: 'boolean', example: true },
              hasPrevPage: { type: 'boolean', example: false },
            },
          },
        },
      },
    }),
  );
}

// Error response
export function ApiErrorResponse(
  statusCode: number,
  description: string,
  errorName: string,
  message: string,
) {
  return ApiResponse({
    status: statusCode,
    description,
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: statusCode },
        message: { type: 'string', example: message },
        error: { type: 'string', example: errorName },
      },
    },
  });
}