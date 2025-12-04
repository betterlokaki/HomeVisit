/**
 * Configuration Parsers
 * Single Responsibility: Parse configuration values from environment
 */

/**
 * Parse map style URL from environment
 * Supports both string URLs and JSON object configurations
 */
export function parseStyleUrl(
  styleUrlEnv: string | undefined
): string | object {
  if (!styleUrlEnv) {
    return "https://demotiles.maplibre.org/style.json";
  }
  if (styleUrlEnv.startsWith("{")) {
    try {
      return JSON.parse(styleUrlEnv);
    } catch {
      return styleUrlEnv;
    }
  }
  return styleUrlEnv;
}

/**
 * Parse map center coordinates from environment
 * Format: "longitude,latitude"
 */
export function parseCenter(centerEnv: string | undefined): [number, number] {
  if (!centerEnv) {
    return [34.7683, 32.0853];
  }
  const [lng, lat] = centerEnv.split(",").map((v) => parseFloat(v.trim()));
  return [lng, lat];
}
