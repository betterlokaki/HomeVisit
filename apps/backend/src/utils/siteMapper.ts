/**
 * Site Mapper
 * Single Responsibility: Transform site DTOs to domain objects
 */

import type { Site } from "@homevisit/common";
import type { SiteWithUsers } from "../interfaces/SiteDTO.ts";
import { normalizeGeometryToWkt } from "./geojsonToWkt.ts";
import { logger } from "../middleware/logger.ts";

/**
 * Convert geometry to WKT format safely
 */
function convertToWkt(geometry: any): string {
  try {
    return normalizeGeometryToWkt(geometry);
  } catch (error) {
    logger.warn("Failed to convert geometry to WKT", { geometry, error });
    return "POLYGON((0 0, 0 0, 0 0, 0 0))";
  }
}

/**
 * Map SiteWithUsers DTO to Site domain object
 */
export function mapToSite(dto: SiteWithUsers): Site {
  return {
    site_id: dto.site_id,
    site_name: dto.site_name,
    group_id: dto.group_id,
    username: dto.users.username,
    display_name: dto.users.display_name,
    seen_status: dto.seen_status as any,
    seen_date: new Date(dto.seen_date),
    geometry: convertToWkt(dto.geometry),
  };
}

/**
 * Map array of SiteWithUsers DTOs to Site domain objects
 */
export function mapToSites(dtos: SiteWithUsers[]): Site[] {
  return dtos.map(mapToSite);
}
