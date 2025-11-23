/**
 * API Response Types
 */

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: Record<string, any>;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, any>;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
