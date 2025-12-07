/**
 * Site query builder - builds PostgREST queries for sites
 */

const SITE_SELECT =
  "site_id,site_name,group_id,user_id,seen_status,seen_date,geometry,users(username,display_name)";

export function buildSiteQuery(
  groupId: number,
  userIds?: number[],
  seenStatuses?: string[]
): string {
  const filters = [`group_id=eq.${groupId}`];

  if (userIds?.length) {
    filters.push(`user_id=in.(${userIds.join(",")})`);
  }

  if (seenStatuses?.length) {
    filters.push(
      `seen_status=in.(${seenStatuses.map((s) => `"${s}"`).join(",")})`
    );
  }

  return `/sites?${filters.join("&")}&select=${SITE_SELECT}`;
}

export function buildSiteByGroupQuery(groupId: number): string {
  return `/sites?group_id=eq.${groupId}&select=${SITE_SELECT}`;
}

export function buildSiteByNameQuery(siteName: string): string {
  return `/sites?site_name=eq.${encodeURIComponent(
    siteName
  )}&select=${SITE_SELECT}&limit=1`;
}

export function buildSiteByIdQuery(siteId: number): string {
  return `/sites?site_id=eq.${siteId}&select=${SITE_SELECT}&limit=1`;
}
