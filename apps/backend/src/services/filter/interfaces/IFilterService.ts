/**
 * Interface for Filter Service
 */

import type { EnrichedSite, FilterRequest } from "@homevisit/common";

export interface IFilterService {
  applyRuntimeFilters(
    sites: EnrichedSite[],
    filterRequest: FilterRequest
  ): EnrichedSite[];
}
