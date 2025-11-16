/**
 * Environment configuration
 */
export const config = {
  port: process.env.PORT || 4000,
  postgrestUrl: process.env.POSTGREST_URL || "http://localhost:3000",
  environment: process.env.NODE_ENV || "development",
  logLevel: process.env.LOG_LEVEL || "info",
};
