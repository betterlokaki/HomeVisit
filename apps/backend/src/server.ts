/**
 * HomeVisit Backend Server
 *
 * Main entry point for the Express server
 * Provides enriched site data with dynamic status calculation and link generation
 */

import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { logger } from "./middleware/logger.js";
import sitesRoutes from "./routes/sitesRoutes.js";

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.path}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.environment,
  });
});

// Sites routes
app.use("/sites", sitesRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Unhandled error", err);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        config.environment === "development"
          ? err.message
          : "An error occurred",
    });
  }
);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = config.port as number;

app.listen(PORT, () => {
  logger.info(`🚀 Backend server started`, {
    port: PORT,
    environment: config.environment,
    postgrestUrl: config.postgrestUrl,
  });
});
