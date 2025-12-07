/**
 * API Response union type
 */

import type { ApiSuccessResponse } from "./ApiSuccessResponse.js";
import type { ApiErrorResponse } from "./ApiErrorResponse.js";

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
