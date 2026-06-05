export class PaginationMeta {
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
  hasNextPage!: boolean;
  hasPrevPage!: boolean;

  static create(total: number, page: number, limit: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}

export class ApiResponseDto<T> {
  success!: boolean;
  statusCode!: number;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
  error?: string;

  private constructor(partial: ApiResponseDto<T>) {
    Object.assign(this, partial);
  }

  static success<T>(
    data: T,
    message = 'OK',
    statusCode = 200,
  ): ApiResponseDto<T> {
    return new ApiResponseDto({ success: true, statusCode, message, data });
  }

  static paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    message = 'OK',
    statusCode = 200,
  ): ApiResponseDto<T[]> {
    return new ApiResponseDto({
      success: true,
      statusCode,
      message,
      data,
      pagination,
    });
  }

  static error(
    message: string,
    statusCode: number,
    error?: string,
  ): ApiResponseDto<null> {
    return new ApiResponseDto({ success: false, statusCode, message, error });
  }
}