/**
 * Geometry Merger - Combines multiple WKT geometries into a single MultiPolygon
 */
import { parse } from "wellknown";
import { logger } from "../middleware/logger.ts";

export function mergeGeometriesToMultiPolygon(wktGeometries: string[]): string {
  try {
    if (!wktGeometries?.length) return "";

    const polygons = wktGeometries
      .filter(
        (wkt) => wkt && (typeof wkt === "string" ? wkt.trim().length > 0 : true)
      )
      .map((wkt) => {
        try {
          return typeof wkt === "string" ? parse(wkt) : wkt;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    if (polygons.length === 0) return "";

    const coords = polygons
      .map((g: any) => (g.type === "Polygon" ? g.coordinates : null))
      .filter(Boolean);

    if (coords.length === 0) return "";

    const multiPolygon = { type: "MultiPolygon" as const, coordinates: coords };
    return geometryToWKT(multiPolygon);
  } catch (error) {
    logger.error("Error merging geometries", error);
    return "";
  }
}

function geometryToWKT(geometry: any): string {
  if (geometry.type === "MultiPolygon") {
    const rings = geometry.coordinates
      .map(
        (polygon: number[][][]) =>
          `(${polygon
            .map(
              (ring: number[][]) =>
                `(${ring.map((c: number[]) => `${c[0]} ${c[1]}`).join(", ")})`
            )
            .join(", ")})`
      )
      .join(", ");
    return `MULTIPOLYGON(${rings})`;
  }
  if (geometry.type === "Polygon") {
    const rings = geometry.coordinates
      .map(
        (ring: number[][]) =>
          `(${ring.map((c: number[]) => `${c[0]} ${c[1]}`).join(", ")})`
      )
      .join(", ");
    return `POLYGON(${rings})`;
  }
  throw new Error(`Unsupported geometry type: ${geometry.type}`);
}
