/**
 * History API Client
 * Single Responsibility: HTTP communication for history-related data
 */

import type { SeenStatus } from "@homevisit/common";
import { API_CONFIG } from "../../config/env";

const API_BASE_URL = API_CONFIG.baseUrl;

/**
 * Update history status for a site on a specific date
 */
export async function updateHistoryStatus(
  siteName: string,
  groupName: string,
  date: string, // YYYY-MM-DD format
  status: SeenStatus
): Promise<void> {
  const url = new URL(`${API_BASE_URL}/sites/history`);
  url.searchParams.append("site_name", siteName);
  url.searchParams.append("group_name", groupName);
  url.searchParams.append("date", date);

  const response = await fetch(url.toString(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("History update API error", {
      status: response.status,
      statusText: response.statusText,
      errorText,
    });
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }
}
