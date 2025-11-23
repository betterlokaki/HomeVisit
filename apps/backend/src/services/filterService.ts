import type { FilterRequest } from "@homevisit/common";
import type { EnrichedSite } from "@homevisit/common";

/**
 * Filter Service - Single Responsibility: Filter logic
 */
export class FilterService {
  applyRuntimeFilters(
    sites: EnrichedSite[],
    filters: FilterRequest
  ): EnrichedSite[] {
    let filtered = sites;

    if (filters.updatedStatuses?.length) {
      filtered = filtered.filter((s) =>
        filters.updatedStatuses!.includes(s.updatedStatus)
      );
    }

    return filtered;
  }

  buildQuery(
    groupId: number,
    username?: string,
    seenStatuses?: string[]
  ): string {
    const params = [`group_id=eq.${groupId}`];

    if (username) {
      params.push(`username=eq.${encodeURIComponent(username)}`);
    }

    if (seenStatuses?.length) {
      const list = seenStatuses.map((s) => `"${s}"`).join(",");
      params.push(`seen_status=in.(${list})`);
    }

    return `/sites?${params.join(
      "&"
    )}&select=site_id,site_name,group_id,user_id,seen_status,seen_date,geometry`;
  }
}
