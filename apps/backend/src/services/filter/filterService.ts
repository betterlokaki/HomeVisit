import type { EnrichedSite, FilterRequest } from "@homevisit/common";
import type { IFilterService } from "./interfaces/IFilterService.ts";

const SITES_SELECT =
  "site_id,site_name,group_id,user_id,seen_status,seen_date,geometry";

/**
 * Filter Service - Single Responsibility: Filter logic
 */
export class FilterService implements IFilterService {
  applyRuntimeFilters(
    sites: EnrichedSite[],
    filters: FilterRequest
  ): EnrichedSite[] {
    if (!filters.updatedStatuses?.length) {
      return sites;
    }
    return sites.filter((s) =>
      filters.updatedStatuses!.includes(s.updatedStatus)
    );
  }

  buildQuery(
    groupId: number,
    username?: string,
    seenStatuses?: string[]
  ): string {
    const params = this.buildQueryParams(groupId, username, seenStatuses);
    return `/sites?${params.join("&")}&select=${SITES_SELECT}`;
  }

  private buildQueryParams(
    groupId: number,
    username?: string,
    seenStatuses?: string[]
  ): string[] {
    const params = [`group_id=eq.${groupId}`];

    if (username) {
      params.push(`username=eq.${encodeURIComponent(username)}`);
    }

    if (seenStatuses?.length) {
      const list = seenStatuses.map((s) => `"${s}"`).join(",");
      params.push(`seen_status=in.(${list})`);
    }

    return params;
  }
}
