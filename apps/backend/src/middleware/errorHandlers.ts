/**
 * Error Handling Middleware
 *
 * Centralized error handling for Express app.
 */

import { Express, Request, Response, NextFunction } from "express";
import { config } from "../config/env.ts";
import { logger } from "./logger.ts";
import { ERROR_FIELD, MESSAGE_FIELD } from "../config/constants.ts";

/**
 * 404 Not Found handler
 */
function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    [ERROR_FIELD]: "Not Found",
    path: req.path,
    method: req.method,
  });
}

/**
 * Global error handler
 */
function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error("Unhandled error", err);
  res.status(500).json({
    [ERROR_FIELD]: "Internal Server Error",
    [MESSAGE_FIELD]:
      config.NODE_ENV === "development" ? err.message : "An error occurred",
  });
}

/**
 * Setup all error handlers
 */
export function setupErrorHandlers(app: Express): void {
  app.use(notFoundHandler);
  app.use(errorHandler);
}
