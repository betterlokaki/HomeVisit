/**
 * Map configuration for MapLibre GL
 * Loads from environment variables
 */

import { parseStyleUrl, parseCenter } from "./configParsers";

export const MAP_CONFIG = {
  styleUrl: parseStyleUrl(import.meta.env.VITE_MAP_STYLE_URL),
  defaultCenter: parseCenter(import.meta.env.VITE_MAP_DEFAULT_CENTER),
  defaultZoom:
    parseFloat(import.meta.env.VITE_MAP_DEFAULT_ZOOM || "5.5") || 5.5,
  flyDuration:
    parseInt(import.meta.env.VITE_MAP_FLY_DURATION || "1500") || 1500,
};
