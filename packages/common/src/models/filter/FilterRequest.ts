/**
 * Filter request - API request body for filtering sites
 */

export interface FilterRequest {
  username?: string;
  seenStatuses?: string[];
  updatedStatuses?: string[];
}
