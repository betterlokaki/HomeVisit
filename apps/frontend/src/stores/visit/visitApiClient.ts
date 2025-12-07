/**
 * Visit API Client
 * Single Responsibility: HTTP communication for visit-related data
 */

import type { User, MergedHistoryResponse } from "@homevisit/common";
import type { VisitCard } from "./VisitCard";
import type { FilterRequest } from "./FilterRequest";
import { API_CONFIG } from "../../config/env";

const API_BASE_URL = API_CONFIG.baseUrl;

/**
 * Fetch sites from backend with filters
 */
export async function fetchSites(
  groupName: string,
  filterRequest: FilterRequest
): Promise<VisitCard[]> {
  const url = new URL(`${API_BASE_URL}/sites`);
  url.searchParams.append("group", groupName);

  const finalUrl = url.toString().replace(/\+/g, "%20");

  const response = await fetch(finalUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filterRequest),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Update site status on backend
 */
export async function updateSiteStatus(
  siteName: string,
  newStatus: "Not Seen" | "Seen" | "Partial"
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/sites/${encodeURIComponent(siteName)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

/**
 * Fetch group users from backend
 */
export async function fetchGroupUsers(groupName: string): Promise<User[]> {
  const url = `${API_BASE_URL}/sites/group/users?group=${encodeURIComponent(
    groupName
  )}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.users || [];
}

/**
 * Fetch merged cover update and visit history for a site
 */
export async function fetchCoverUpdate(
  siteId: number,
  groupId: number
): Promise<MergedHistoryResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/cover-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, groupId }),
    });

    if (!response.ok) {
      console.error(`Cover update HTTP error! status: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch cover update:", error);
    return null;
  }
}
