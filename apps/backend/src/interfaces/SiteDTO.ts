/**
 * Site Data Transfer Objects
 * Single Responsibility: Define data structures for site API responses
 */

export interface SiteWithUsers {
  site_id: number;
  site_name: string;
  group_id: number;
  user_id: number;
  seen_status: string;
  seen_date: string;
  geometry: any;
  users: { username: string; display_name: string };
}
