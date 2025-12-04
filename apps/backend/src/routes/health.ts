/**
 * Health Check Route
 *
 * Provides service health status endpoint.
 */

import { Express, Request, Response } from "express";
import { config } from "../config/env.ts";

/**
 * Health check endpoint handler
 */
function healthCheck(req: Request, res: Response): void {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
}

/**
 * Setup health check route
 */
export function setupHealthCheck(app: Express): void {
  app.get("/health", healthCheck);
}
