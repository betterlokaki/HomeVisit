/**
 * Interface for Enrichment Service
 */

import type { Site, EnrichedSite, Group } from "@homevisit/common";

export interface IEnrichmentService {
  enrichSites(sites: Site[], group: Group): Promise<EnrichedSite[]>;
}
