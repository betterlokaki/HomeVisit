/**
 * Filter Request - API request body for filtering sites
 */

export interface FilterRequest {
  usernames?: string[];
  seenStatuses?: string[];
  updatedStatuses?: string[];
}
