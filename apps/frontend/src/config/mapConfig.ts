/**
 * Map configuration for MapLibre GL
 */

export const MAP_CONFIG = {
  // OSM style URL (can be changed later for other services)
  styleUrl: "https://demotiles.maplibre.org/style.json",

  // Default center if no sites exist [lng, lat]
  defaultCenter: [34.7683, 32.0853], // Israel center

  // Default zoom level
  defaultZoom: 5.5,

  // Animation duration for fly-to in milliseconds
  flyDuration: 1500,
};
