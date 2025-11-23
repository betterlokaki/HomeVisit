/**
 * Response utilities for consistent API responses
 */

import { Response } from "express";
import { logger } from "../middleware/logger";
import {
  RESPONSE_SUCCESS_FIELD,
  RESPONSE_DATA_FIELD,
  ERROR_FIELD,
} from "../config/constants";

/**
 * Send successful response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200
): void {
  res.status(statusCode).json(data);
}

/**
 * Send error response with logging
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: unknown
): void {
  if (error) {
    logger.error(message, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  } else {
    logger.error(message);
  }
  res.status(statusCode).json({ [ERROR_FIELD]: message });
}

/**
 * Send validation error
 */
export function sendValidationError(res: Response, message: string): void {
  sendError(res, message, 400);
}

/**
 * Send not found error
 */
export function sendNotFound(res: Response, resource: string): void {
  sendError(res, `${resource} not found`, 404);
}

/**
 * Send success with metadata
 */
export function sendSuccessWithMeta<T>(
  res: Response,
  data: T,
  meta?: Record<string, any>,
  statusCode: number = 200
): void {
  const response = {
    [RESPONSE_SUCCESS_FIELD]: true,
    [RESPONSE_DATA_FIELD]: data,
    ...meta,
  };
  res.status(statusCode).json(response);
}
