/**
 * Frontend Environment Configuration
 */

export const API_CONFIG = {
  baseUrl:
    typeof process !== "undefined"
      ? process.env.VITE_API_BASE_URL || "http://localhost:4000"
      : (globalThis as any).VITE_API_BASE_URL || "http://localhost:4000",
};

export const MAP_CONFIG = {
  // Style URL - can be a string URL or object (for XYZ tiles, etc.)
  styleUrl: parseStyleUrl(
    typeof process !== "undefined"
      ? process.env.VITE_MAP_STYLE_URL
      : (globalThis as any).VITE_MAP_STYLE_URL
  ),

  // Default center if no sites exist [lng, lat]
  defaultCenter: parseCenter(
    typeof process !== "undefined"
      ? process.env.VITE_MAP_DEFAULT_CENTER
      : (globalThis as any).VITE_MAP_DEFAULT_CENTER
  ),

  // Default zoom level
  defaultZoom:
    parseFloat(
      typeof process !== "undefined"
        ? process.env.VITE_MAP_DEFAULT_ZOOM || "5.5"
        : (globalThis as any).VITE_MAP_DEFAULT_ZOOM || "5.5"
    ) || 5.5,

  // Animation duration for fly-to in milliseconds
  flyDuration:
    parseInt(
      typeof process !== "undefined"
        ? process.env.VITE_MAP_FLY_DURATION || "1500"
        : (globalThis as any).VITE_MAP_FLY_DURATION || "1500"
    ) || 1500,
};

function parseStyleUrl(styleUrlEnv: string | undefined): string | object {
  if (!styleUrlEnv) {
    return "https://demotiles.maplibre.org/style.json";
  }
  // Try to parse as JSON object first
  if (styleUrlEnv.startsWith("{")) {
    try {
      return JSON.parse(styleUrlEnv);
    } catch {
      // If JSON parsing fails, return as string
      return styleUrlEnv;
    }
  }
  // Return as string URL
  return styleUrlEnv;
}

function parseCenter(centerEnv: string | undefined): [number, number] {
  if (!centerEnv) {
    return [34.7683, 32.0853];
  }
  const [lng, lat] = centerEnv.split(",").map((v) => parseFloat(v.trim()));
  return [lng, lat];
}
