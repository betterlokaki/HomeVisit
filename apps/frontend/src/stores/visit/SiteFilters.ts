/**
 * Site Filters - UI state for filter buttons
 */

export interface SiteFilters {
  selectedUsers: string[];
  awaiting: boolean;
  collection: boolean;
  completedFull: boolean;
  completedPartial: boolean;
}
