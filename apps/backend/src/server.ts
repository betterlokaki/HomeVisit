/**
 * Express Application Factory
 *
 * Creates and configures the Express app with middleware and routes.
 */

import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { config } from "./config/env.ts";
import { CORS_ORIGINS, REQUEST_JSON_LIMIT } from "./config/constants.ts";
import { logger } from "./middleware/logger.ts";
import { setupErrorHandlers } from "./middleware/errorHandlers.ts";
import { setupHealthCheck } from "./routes/health.ts";
import { statusRefreshScheduler } from "./services/statusRefreshScheduler.ts";
import { swaggerSpec } from "./swagger.ts";
import { loadEnrichmentConfig } from "./config/enrichmentConfig.ts";

// Load enrichment config BEFORE importing routes (which instantiate controllers)
try {
  loadEnrichmentConfig();
  logger.info("✅ Enrichment config loaded successfully");
} catch (error) {
  logger.error("⚠️ Failed to load enrichment config", error);
  process.exit(1);
}

// Import routes AFTER config is loaded
const sitesRoutes = (await import("./routes/sitesRoutes.ts")).default;
const authRoutes = (await import("./routes/authRoutes.ts")).default;
const coverUpdateRoutes = (await import("./routes/coverUpdateRoutes.ts"))
  .default;

// Import enrichment cache scheduler AFTER config is loaded
const { enrichmentCacheScheduler } = await import(
  "./controllers/controllerFactory.ts"
);

const app = express();

// Middleware
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json({ limit: REQUEST_JSON_LIMIT }));
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.path}`);
  next();
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve as any);
app.get("/api-docs", swaggerUi.setup(swaggerSpec) as any);

// Routes
setupHealthCheck(app);
app.use("/auth", authRoutes);
app.use("/sites", sitesRoutes);
app.use("/cover-update", coverUpdateRoutes);

// Error handlers
setupErrorHandlers(app);

// Start server
const PORT = config.PORT;
app.listen(PORT, "0.0.0.0", async () => {
  logger.info(`🚀 Backend server started`, {
    port: PORT,
    environment: config.NODE_ENV,
    postgrestUrl: config.POSTGREST_URL,
  });

  // Initialize status refresh scheduler
  try {
    await statusRefreshScheduler.start();
    logger.info("✅ Status refresh scheduler started successfully");
  } catch (error) {
    logger.error("⚠️ Failed to start status refresh scheduler", error);
    // Don't exit the process, the scheduler is not critical
  }

  // Initialize enrichment cache scheduler
  try {
    await enrichmentCacheScheduler.start();
    logger.info("✅ Enrichment cache scheduler started successfully");
  } catch (error) {
    logger.error("⚠️ Failed to start enrichment cache scheduler", error);
    // Don't exit the process, requests will fall back to slow API
  }
});

export default app;
