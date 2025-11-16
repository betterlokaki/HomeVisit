/**
 * Shared type definitions for Site entity
 */

export type SiteStatus = "online" | "offline" | "maintenance";
export type UpdatedStatus = "Full" | "Partial" | "No";

export interface Site {
  site_id: number;
  site_code: string;
  name: string;
  geometry: GeoJSON.Point;
  group_id: number;
  status: SiteStatus;
  last_seen: string;
  last_data: string;
  created_at: string;
  updated_at: string;
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
    user_id: number;
    sites: EnrichedSite[];
  };
}

export interface SiteCardProps {
  site: EnrichedSite;
}

// GeoJSON types
namespace GeoJSON {
  export interface Point {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  }

  export interface Feature<T = any> {
    type: "Feature";
    geometry: T;
    properties: any;
  }
}

export { GeoJSON };
