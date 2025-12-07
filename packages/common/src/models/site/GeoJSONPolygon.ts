/**
 * GeoJSON Polygon type for geometry operations
 */

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: [number, number][][]; // Array of rings, each ring is array of [longitude, latitude]
}
