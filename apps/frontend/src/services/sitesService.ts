/**
 * Sites API Service
 *
 * Handles all site-related API calls.
 */

import axios from "axios";
import type { EnrichedSite } from "@homevisit/common/src";
import { API_BASE_URL, BACKEND_SITES_ENDPOINT } from "../config/constants";

/**
 * Fetch user sites from backend
 */
export async function fetchUserSites(userId: number): Promise<EnrichedSite[]> {
  const response = await axios.get(`${API_BASE_URL}${BACKEND_SITES_ENDPOINT}`, {
    params: { user_id: userId },
  });
  return response.data.data.sites;
}
