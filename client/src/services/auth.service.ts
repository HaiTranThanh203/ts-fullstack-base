import { apiPost, apiGet } from '@/utils/api';
import { ApiResult } from '@/utils/api';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export async function register(data: RegisterRequest): Promise<ApiResult<AuthResponse>> {
  return apiPost<AuthResponse>('/auth/register', data);
}

export async function login(data: LoginRequest): Promise<ApiResult<AuthResponse>> {
  return apiPost<AuthResponse>('/auth/login', data);
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<ApiResult<ForgotPasswordResponse>> {
  return apiPost<ForgotPasswordResponse>('/auth/forgot-password', data);
}

export async function resetPassword(data: ResetPasswordRequest): Promise<ApiResult<ResetPasswordResponse>> {
  return apiPost<ResetPasswordResponse>('/auth/reset-password', data);
}

export async function changePassword(data: ChangePasswordRequest): Promise<ApiResult<ChangePasswordResponse>> {
  return apiPost<ChangePasswordResponse>('/auth/change-password', data);
}

export async function getCurrentUser(): Promise<ApiResult<UserResponse>> {
  return apiGet<UserResponse>('/auth/me');
}
