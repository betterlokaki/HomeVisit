/**
 * Frontend Environment Configuration
 */

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
};

export const SERVER_CONFIG = {
  allowedHosts: (
    import.meta.env.VITE_ALLOWED_HOSTS || "localhost,127.0.0.1,0.0.0.0"
  )
    .split(",")
    .map((h: string) => h.trim()),
};

export const MAP_CONFIG = {
  // Style URL - can be a string URL or object (for XYZ tiles, etc.)
  styleUrl: parseStyleUrl(import.meta.env.VITE_MAP_STYLE_URL),

  // Default center if no sites exist [lng, lat]
  defaultCenter: parseCenter(import.meta.env.VITE_MAP_DEFAULT_CENTER),

  // Default zoom level
  defaultZoom:
    parseFloat(import.meta.env.VITE_MAP_DEFAULT_ZOOM || "5.5") || 5.5,

  // Animation duration for fly-to in milliseconds
  flyDuration:
    parseInt(import.meta.env.VITE_MAP_FLY_DURATION || "1500") || 1500,
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
