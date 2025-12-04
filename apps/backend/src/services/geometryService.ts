import { logger } from "../middleware/logger.ts";

/**
 * Geometry Service - Single Responsibility: Geometry conversions
 */
export class GeometryService {
  toWKT(geojson: any): string {
    try {
      if (!geojson?.coordinates) return "";
      const [lon, lat] = geojson.coordinates[0][0];
      return `POINT(${lon} ${lat})`;
    } catch (error) {
      logger.error("Failed to convert to WKT", { error });
      return "";
    }
  }

  fromWKT(wkt: string): any {
    try {
      const match = wkt.match(/POINT\(([\d.-]+) ([\d.-]+)\)/);
      if (!match) return null;
      const [, lon, lat] = match;
      return {
        type: "Point",
        coordinates: [parseFloat(lon), parseFloat(lat)],
      };
    } catch (error) {
      logger.error("Failed to convert from WKT", { error });
      return null;
    }
  }
}
