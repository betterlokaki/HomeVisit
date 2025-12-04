/**
 * Geometry Bounds Utilities
 * Single Responsibility: Bounding box calculations for geometries
 */

import { feature as turfFeature } from "@turf/turf";

/**
 * Get bounding box [minX, minY, maxX, maxY] from a feature
 */
export function getBbox(feat: any): [number, number, number, number] {
  const coords = flattenCoords(feat.geometry);
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const [x, y] of coords) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  return [minX, minY, maxX, maxY];
}

/**
 * Check if two bounding boxes intersect
 */
export function bboxIntersect(
  bbox1: [number, number, number, number],
  bbox2: [number, number, number, number]
): boolean {
  return !(
    bbox1[2] < bbox2[0] ||
    bbox1[0] > bbox2[2] ||
    bbox1[3] < bbox2[1] ||
    bbox1[1] > bbox2[3]
  );
}

/**
 * Flatten all coordinates from a geometry
 */
function flattenCoords(geom: any): Array<[number, number]> {
  const coords: Array<[number, number]> = [];

  function traverse(obj: any): void {
    if (Array.isArray(obj)) {
      if (typeof obj[0] === "number") {
        coords.push([obj[0], obj[1]]);
      } else {
        for (const item of obj) traverse(item);
      }
    }
  }

  traverse(geom.coordinates);
  return coords;
}
