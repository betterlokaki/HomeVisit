/**
 * API Error Response
 */

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, any>;
}
