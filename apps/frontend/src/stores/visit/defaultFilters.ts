/**
 * Default filters - initial filter state
 */

import type { SiteFilters } from "./SiteFilters";

export const DEFAULT_FILTERS: SiteFilters = {
  selectedUsers: [],
  awaiting: false,
  collection: false,
  completedFull: false,
  completedPartial: false,
};
