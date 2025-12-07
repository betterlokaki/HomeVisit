/**
 * Response type for getting user sites
 */

import type { EnrichedSite } from "./EnrichedSite.js";

export interface GetUserSitesResponse {
  success: boolean;
  data: {
    username: string;
    sites: EnrichedSite[];
  };
}
