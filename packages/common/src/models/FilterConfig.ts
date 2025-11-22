/**
 * Filter configuration types for site filtering
 */

export interface SiteFilters {
  username: boolean; // Button 1: Filter by current user
  awaiting: boolean; // Button 2: updatedStatus (Full|Partial) AND seen_status (Not Seen|Partial)
  collection: boolean; // Button 3: updatedStatus = "No"
  completedFull: boolean; // Button 4: seen_status = "Seen"
  completedPartial: boolean; // Button 5: seen_status = "Partial"
}

export interface FilterRequest {
  username?: string; // Only included when username filter is active
  seenStatuses?: string[]; // Array of seen_status values to match
  updatedStatuses?: string[]; // Array of updatedStatus values to match
}
