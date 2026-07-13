import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import type { ApiResponse, ApiErrorResponse, PaginationInfo } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;

  constructor(error: ApiErrorResponse) {
    super(error.message);
    this.name = 'ApiError';
    this.statusCode = error.statusCode;
    this.errorCode = error.error;
  }

  toString(): string {
    return `[${this.statusCode}] ${this.message}`;
  }
}

export interface ApiResult<T> {
  data: T;
  statusCode: number;
  message: string;
  pagination?: PaginationInfo;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function request<T>(url: string, options?: AxiosRequestConfig): Promise<ApiResult<T>> {
  try {
    const response = await apiClient.request<ApiResponse<T>>({
      url,
      ...options,
    });

    if (!response.data.success) {
      const errorResponse = response.data as ApiErrorResponse;
      throw new ApiError(errorResponse);
    }

    return {
      data: response.data.data,
      statusCode: response.data.statusCode,
      message: response.data.message,
      pagination: response.data.pagination,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof AxiosError) {
      if (error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new ApiError({
          success: false,
          statusCode: error.response.status,
          message: errorData.message || error.message,
          error: errorData.error || 'UNKNOWN_ERROR',
        });
      }
      throw new ApiError({
        success: false,
        statusCode: error.response?.status || 0,
        message: error.message,
        error: 'NETWORK_ERROR',
      });
    }

    throw error;
  }
}

export async function apiGet<T>(url: string, options?: AxiosRequestConfig): Promise<ApiResult<T>> {
  return request<T>(url, { ...options, method: 'GET' });
}

export async function apiPost<T>(url: string, data?: unknown, options?: AxiosRequestConfig): Promise<ApiResult<T>> {
  return request<T>(url, { ...options, method: 'POST', data });
}

export async function apiPut<T>(url: string, data?: unknown, options?: AxiosRequestConfig): Promise<ApiResult<T>> {
  return request<T>(url, { ...options, method: 'PUT', data });
}

export async function apiDelete<T>(url: string, options?: AxiosRequestConfig): Promise<ApiResult<T>> {
  return request<T>(url, { ...options, method: 'DELETE' });
}

export { apiClient };
