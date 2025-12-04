/**
 * Frontend Environment Configuration
 */

import { parseStyleUrl, parseCenter } from "./configParsers";

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
  styleUrl: parseStyleUrl(import.meta.env.VITE_MAP_STYLE_URL),
  defaultCenter: parseCenter(import.meta.env.VITE_MAP_DEFAULT_CENTER),
  defaultZoom:
    parseFloat(import.meta.env.VITE_MAP_DEFAULT_ZOOM || "5.5") || 5.5,
  flyDuration:
    parseInt(import.meta.env.VITE_MAP_FLY_DURATION || "1500") || 1500,
};
