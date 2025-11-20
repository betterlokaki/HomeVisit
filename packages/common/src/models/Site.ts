/**
 * Shared type definitions for Site entity
 */

export type SeenStatus = "Seen" | "Partial" | "Not Seen";
export type UpdatedStatus = "Full" | "Partial" | "No";

export interface Site {
  site_id: number;
  site_name: string;
  group_id: number;
  username: string;
  seen_status: SeenStatus;
  seen_date: Date;
  geometry: string; // WKT (Well-Known Text) format
}

/**
 * Enriched site with backend-calculated fields
 */
export interface EnrichedSite extends Site {
  updatedStatus: UpdatedStatus;
  siteLink: string;
}

export interface GetUserSitesResponse {
  success: boolean;
  data: {
    username: string;
    sites: EnrichedSite[];
  };
}

export interface SiteCardProps {
  site: EnrichedSite;
}

// GeoJSON types (kept for reference if needed elsewhere)
namespace GeoJSON {
  export interface Polygon {
    type: "Polygon";
    coordinates: [number, number][][]; // Array of rings, each ring is array of [longitude, latitude]
  }
}

export { GeoJSON };
