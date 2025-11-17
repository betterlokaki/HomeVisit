/**
 * Site Data Enrichment Utilities
 *
 * Adds calculated fields to site data.
 */

import {
  SITE_STATUS_OPTIONS,
  STATUS_CALCULATION_DELAY_MS,
  SITE_LINK_DOMAIN,
} from "../config/constants.js";
import type { UpdatedStatus } from "@homevisit/common";

/**
 * Calculate site status (simulated async operation)
 */
export async function calculateStatus(): Promise<UpdatedStatus> {
  await new Promise((resolve) =>
    setTimeout(resolve, STATUS_CALCULATION_DELAY_MS)
  );
  const randomIndex = Math.floor(Math.random() * SITE_STATUS_OPTIONS.length);
  const status = SITE_STATUS_OPTIONS[randomIndex];
  return (status || "No") as UpdatedStatus;
}

/**
 * Generate random site link URL
 */
export function generateSiteLink(): string {
  const randomId = Math.random().toString(36).substring(2, 10);
  const randomToken = Math.random().toString(36).substring(2, 15);
  return `https://site-${randomId}-${randomToken}.${SITE_LINK_DOMAIN}`;
}
