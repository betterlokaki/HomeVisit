import type { FilterSchema } from "@homevisit/common/src/models/OverlaySearch.js";
import type { ElasticProviderOverlay } from "@homevisit/common/src/models/Overlay.js";
import axios from "axios";
import {
  ELASTIC_PROVIDER_BASE_URL,
  ELASTIC_PROVIDER_ENDPOINT,
} from "../config/constants.js";
import { config } from "../config/env.js";

function createSearchFilter(wkt: string, start: Date, end: Date): FilterSchema {
  return {
    filter: {
      logical_operators: {
        AND: [
          {
            match: {
              ImagingTechnique: {
                type: "IN",
                values: ["EO"],
              },
            },
          },
          {
            geo_intersect: {
              geo: {
                type: "IN",
                values: [wkt],
              },
            },
          },
        ],
      },
      range: {
        date: {
          type: "IN",
          values: [
            {
              gte: start.toISOString(),
              lte: end.toISOString(),
            },
          ],
        },
      },
    },
    sort: {
      date: "desc",
    },
  };
}

async function searchOverlays(
  params: FilterSchema
): Promise<ElasticProviderOverlay[]> {
  try {
    // Implementation for searching overlays using the provided filter schema
    let url = `${ELASTIC_PROVIDER_BASE_URL}${ELASTIC_PROVIDER_ENDPOINT}`;

    // Append query parameters if provided
    if (config.OVERLAY_SERVICE_QUERY_PARAMS) {
      url += `?${config.OVERLAY_SERVICE_QUERY_PARAMS}`;
    }

    // Parse headers from env (JSON string)
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

    // Convert response to ElasticProviderOverlay[]
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
