/**
 * Filter Request Builder
 * Single Responsibility: Build API filter requests from filter state
 */

import type { SiteFilters } from "./SiteFilters";
import type { FilterRequest } from "./FilterRequest";

/**
 * Build API filter request from filters state
 */
export function buildFilterRequest(filters: SiteFilters): FilterRequest {
  let request: FilterRequest = {};

  if (filters.selectedUsers.length > 0) {
    request.usernames = filters.selectedUsers;
  }

  const seenStatusFilters: Set<string> = new Set();
  const updatedStatusFilters: Set<string> = new Set();

  if (filters.awaiting) {
    updatedStatusFilters.add("Full");
    updatedStatusFilters.add("Partial");
    seenStatusFilters.add("Not Seen");
    seenStatusFilters.add("Partial");
  }

  if (filters.collection) {
    updatedStatusFilters.add("No");
  }

  if (filters.completedFull) {
    seenStatusFilters.add("Seen");
  }

  if (filters.completedPartial) {
    seenStatusFilters.add("Partial");
  }

  if (seenStatusFilters.size > 0) {
    request.seenStatuses = Array.from(seenStatusFilters);
  }

  if (updatedStatusFilters.size > 0) {
    request.updatedStatuses = Array.from(updatedStatusFilters);
  }

  return request;
}
