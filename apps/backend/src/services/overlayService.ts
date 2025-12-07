/**
 * Overlay Service
 * Single Responsibility: Fetch overlays from external elastic provider
 */

import type { FilterSchema, ElasticProviderOverlay } from "@homevisit/common";
import axios from "axios";
import {
  ELASTIC_PROVIDER_BASE_URL,
  ELASTIC_PROVIDER_ENDPOINT,
} from "../config/constants.ts";
import { config } from "../config/env.ts";
import { createSearchFilter } from "./overlayFilterBuilder.ts";

async function searchOverlays(
  params: FilterSchema
): Promise<ElasticProviderOverlay[]> {
  try {
    let url = `${ELASTIC_PROVIDER_BASE_URL}${ELASTIC_PROVIDER_ENDPOINT}`;

    if (config.OVERLAY_SERVICE_QUERY_PARAMS) {
      url += `?${config.OVERLAY_SERVICE_QUERY_PARAMS}`;
    }

    let headers: Record<string, string> = {};
    if (config.OVERLAY_SERVICE_HEADERS) {
      try {
        headers = JSON.parse(config.OVERLAY_SERVICE_HEADERS);
      } catch {
        console.warn(
          "Failed to parse OVERLAY_SERVICE_HEADERS, using empty headers"
        );
      }
    }

    const response = await axios.post(url, params, headers);
    const overlays: ElasticProviderOverlay[] =
      response.data.entities_list || [];
    return overlays;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Elastic provider failed because ${message}`);
  }
}

export async function fetchOverlays(
  wkt: string,
  start: Date,
  end: Date
): Promise<ElasticProviderOverlay[]> {
  const filter = createSearchFilter(wkt, start, end);
  const overlays = await searchOverlays(filter);
  return overlays;
}
