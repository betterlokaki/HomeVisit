/**
 * Express Application Factory
 *
 * Creates and configures the Express app with middleware and routes.
 */

import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { CORS_ORIGINS, REQUEST_JSON_LIMIT } from "./config/constants.js";
import { logger } from "./middleware/logger.js";
import sitesRoutes from "./routes/sitesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { setupErrorHandlers } from "./middleware/errorHandlers.js";
import { setupHealthCheck } from "./routes/health.js";

const app = express();

// Middleware
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json({ limit: REQUEST_JSON_LIMIT }));
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.path}`);
  next();
});

// Routes
setupHealthCheck(app);
app.use("/auth", authRoutes);
app.use("/sites", sitesRoutes);

// Error handlers
setupErrorHandlers(app);

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  logger.info(`🚀 Backend server started`, {
    port: PORT,
    environment: config.NODE_ENV,
    postgrestUrl: config.POSTGREST_URL,
  });
});

export default app;
