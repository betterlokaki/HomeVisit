/**
 * Visit API Client
 * Single Responsibility: HTTP communication for visit-related data
 */

import type { User } from "@homevisit/common";
import type { VisitCard, FilterRequest } from "./visitStore";
import { API_CONFIG } from "../config/env";

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
    headers: {
      "Content-Type": "application/json",
    },
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
      headers: {
        "Content-Type": "application/json",
      },
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
  console.log("Fetching users from:", url);

  const response = await fetch(url);
  console.log("Response status:", response.status);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log("Response data:", data);

  return data.users || [];
}
