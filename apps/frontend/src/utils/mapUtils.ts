import type { VisitCard } from "../stores/visitStore";

/**
 * Convert WKT (Well-Known Text) geometry to GeoJSON Feature
 */
export function wktToGeoJSON(
  wkt: string,
  properties: Record<string, any> = {}
) {
  // Simple WKT Polygon parser: "POLYGON((lon1 lat1, lon2 lat2, ...))"
  // Normalize whitespace
  const normalizedWkt = wkt.trim().replace(/\s+/g, " ");

  const polygonMatch = normalizedWkt.match(
    /POLYGON\s*\(\s*\(\s*(.*?)\s*\)\s*\)/i
  );
  if (!polygonMatch) {
    console.error("WKT parsing failed for:", wkt);
    throw new Error(`Invalid WKT format: ${wkt}`);
  }

  const coordString = polygonMatch[1];
  const coordinates = coordString.split(",").map((coord) => {
    const parts = coord.trim().split(/\s+/);
    if (parts.length < 2) {
      console.error("Invalid coordinate:", coord);
      return [0, 0];
    }
    const lon = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    if (isNaN(lon) || isNaN(lat)) {
      console.error("Non-numeric coordinates:", parts);
      return [0, 0];
    }
    return [lon, lat];
  });

  return {
    type: "Feature",
    properties,
    geometry: {
      type: "Polygon",
      coordinates: [coordinates],
    },
  };
}

/**
 * Get polygon color based on status (updatedStatus or mergedStatus)
 * Returns {strokeColor, fillColor} in hex format and opacity
 * Supports both coverStatus (No, Full, Partial) and mergedStatus (Seen, Not Seen, Partial Seen, Partial Cover, Not Cover)
 */
export function getPolygonColor(status: string): {
  stroke: string;
  fill: string;
  fillOpacity: number;
} {
  // Map status to colors
  // Using hex values corresponding to Tailwind colors
  const colorMap: Record<
    string,
    { stroke: string; fill: string; fillOpacity: number }
  > = {
    // Cover statuses
    No: {
      stroke: "#ef4444", // red-500
      fill: "#ef4444",
      fillOpacity: 0.3,
    },
    Full: {
      stroke: "#facc15", // yellow-400
      fill: "#facc15",
      fillOpacity: 0.3,
    },
    Partial: {
      stroke: "#facc15", // yellow-400
      fill: "#facc15",
      fillOpacity: 0.3,
    },
    // Merged statuses (from history)
    Seen: {
      stroke: "#4ade80", // green-400
      fill: "#4ade80",
      fillOpacity: 0.3,
    },
    "Not Seen": {
      stroke: "#facc15", // yellow-400
      fill: "#facc15",
      fillOpacity: 0.3,
    },
    "Partial Seen": {
      stroke: "#fbbf24", // yellow-500 (slightly darker for partial)
      fill: "#fbbf24",
      fillOpacity: 0.3,
    },
    "Partial Cover": {
      stroke: "#facc15", // yellow-400
      fill: "#facc15",
      fillOpacity: 0.3,
    },
    "Not Cover": {
      stroke: "#ef4444", // red-500
      fill: "#ef4444",
      fillOpacity: 0.3,
    },
  };

  return colorMap[status] || colorMap["Full"];
}

/**
 * Calculate bounding box from array of coordinates
 * Returns [minLng, minLat, maxLng, maxLat]
 */
export function calculateBounds(
  coordinates: Array<[number, number]>
): [number, number, number, number] {
  let minLng = coordinates[0][0];
  let maxLng = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLat = coordinates[0][1];

  for (const [lng, lat] of coordinates) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  return [minLng, minLat, maxLng, maxLat];
}

/**
 * Get convex hull of all site geometries (simple approach: bounding box of all)
 * For now, we'll use the bounding box of all coordinates
 */
export function getConvexHullBounds(
  cards: VisitCard[]
): [number, number, number, number] | null {
  const allCoords: Array<[number, number]> = [];

  for (const card of cards) {
    try {
      // Geometry is always WKT string from backend
      const geoJSON = wktToGeoJSON(card.geometry);
      const coords = geoJSON.geometry.coordinates[0] as Array<[number, number]>;
      allCoords.push(...coords);
    } catch {
      // Skip invalid geometries
    }
  }

  if (allCoords.length === 0) {
    return null;
  }

  return calculateBounds(allCoords);
}
