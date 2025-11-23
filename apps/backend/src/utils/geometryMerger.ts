/**
 * Geometry Merger Utility
 *
 * Combines multiple WKT geometries into a single MultiPolygon using Turf.js
 */

import { featureCollection, polygon } from "@turf/turf";
import { parse } from "wellknown";
import { logger } from "../middleware/logger.js";

/**
 * Combine multiple WKT geometries into a single MultiPolygon WKT string
 *
 * @param wktGeometries - Array of WKT geometry strings (typically POLYGON)
 * @returns MultiPolygon WKT string or null if no valid geometries
 */
export function mergeGeometriesToMultiPolygon(wktGeometries: string[]): string {
  try {
    if (!wktGeometries || wktGeometries.length === 0) {
      logger.warn("No geometries provided to merge");
      return "";
    }

    // Parse WKT strings or handle GeoJSON objects
    const polygons = wktGeometries
      .filter(
        (wkt) => wkt && (typeof wkt === "string" ? wkt.trim().length > 0 : true)
      )
      .map((wkt) => {
        try {
          let parsed: any;
          if (typeof wkt === "string") {
            parsed = parse(wkt);
          } else {
            parsed = wkt;
          }
          if (!parsed) {
            logger.warn("Failed to parse geometry", { wkt });
            return null;
          }
          return parsed;
        } catch (error) {
          logger.error("Error parsing geometry", { wkt, error });
          return null;
        }
      })
      .filter((geom) => geom !== null);

    if (polygons.length === 0) {
      logger.warn("No valid polygons to merge");
      return "";
    }

    // Extract polygon coordinates from parsed geometries
    const polygonCoordinates = polygons
      .map((geom: any) => {
        if (geom.type === "Polygon") {
          return geom.coordinates;
        }
        logger.warn("Unexpected geometry type, skipping", { type: geom.type });
        return null;
      })
      .filter((coords) => coords !== null);

    if (polygonCoordinates.length === 0) {
      logger.warn("No valid polygon coordinates extracted");
      return "";
    }

    // Create MultiPolygon GeoJSON
    const multiPolygon = {
      type: "MultiPolygon" as const,
      coordinates: polygonCoordinates,
    };

    // Convert back to WKT
    const wktOutput = geometryToWKT(multiPolygon);

    logger.debug("Successfully merged geometries to MultiPolygon", {
      inputCount: wktGeometries.length,
      validCount: polygonCoordinates.length,
    });

    return wktOutput;
  } catch (error) {
    logger.error("Error merging geometries", error);
    return "";
  }
}

/**
 * Convert GeoJSON geometry to WKT string
 */
function geometryToWKT(geometry: any): string {
  if (geometry.type === "MultiPolygon") {
    const rings = geometry.coordinates
      .map((polygon: number[][][]) => {
        const polygonRings = polygon
          .map((ring: number[][]) => {
            const coords = ring
              .map((coord: number[]) => `${coord[0]} ${coord[1]}`)
              .join(", ");
            return `(${coords})`;
          })
          .join(", ");
        return `(${polygonRings})`;
      })
      .join(", ");
    return `MULTIPOLYGON(${rings})`;
  }

  if (geometry.type === "Polygon") {
    const rings = geometry.coordinates
      .map((ring: number[][]) => {
        const coords = ring
          .map((coord: number[]) => `${coord[0]} ${coord[1]}`)
          .join(", ");
        return `(${coords})`;
      })
      .join(", ");
    return `POLYGON(${rings})`;
  }

  throw new Error(`Unsupported geometry type: ${geometry.type}`);
}
