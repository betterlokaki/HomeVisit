/**
 * Convert GeoJSON Polygon to WKT (Well-Known Text) format
 */
export function geojsonPolygonToWkt(geojson: any): string {
  if (!geojson || geojson.type !== "Polygon" || !geojson.coordinates) {
    throw new Error("Invalid GeoJSON Polygon");
  }

  const coordinates = geojson.coordinates[0]; // First ring (outer boundary)
  const coords = coordinates
    .map((coord: [number, number]) => `${coord[0]} ${coord[1]}`)
    .join(", ");

  return `POLYGON((${coords}))`;
}

/**
 * Convert geometry object (can be GeoJSON or string) to WKT string
 */
export function normalizeGeometryToWkt(geometry: any): string {
  // If already a string, assume it's WKT
  if (typeof geometry === "string") {
    return geometry;
  }

  // If it's a GeoJSON object, convert it
  if (typeof geometry === "object" && geometry.type === "Polygon") {
    return geojsonPolygonToWkt(geometry);
  }

  throw new Error(`Unsupported geometry type: ${JSON.stringify(geometry)}`);
}
