/**
 * Vite Server Configuration
 *
 * Centralized server configuration for development environment.
 * Loads and provides all server-related settings.
 */

interface ServerConfig {
  port: number;
  host: string;
  allowedHosts: string[];
}

function getServerConfig(): ServerConfig {
  const allowedHostsEnv =
    import.meta.env.VITE_ALLOWED_HOSTS || "localhost,127.0.0.1,0.0.0.0";

  return {
    port: parseInt(import.meta.env.VITE_SERVER_PORT || "5174", 10),
    host: import.meta.env.VITE_SERVER_HOST || "0.0.0.0",
    allowedHosts: allowedHostsEnv
      .split(",")
      .map((host: string) => host.trim())
      .filter((host: string) => host.length > 0),
  };
}

export const SERVER_CONFIG = getServerConfig();
