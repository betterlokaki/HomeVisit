/**
 * Site with users DTO - PostgREST response structure
 */

export interface SiteWithUsers {
  site_id: number;
  site_name: string;
  group_id: number;
  user_id: number;
  seen_status: string;
  seen_date: string;
  geometry: string;
  users: {
    username: string;
    display_name: string;
  };
}
