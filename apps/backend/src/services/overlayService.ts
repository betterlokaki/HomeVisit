import type { FilterSchema } from "@homevisit/common/src/models/OverlaySearch.js";
import type { ElasticProviderOverlay } from "@homevisit/common/src/models/Overlay.js";
import axios from "axios";
import { ELASTIC_PROVIDER_URL } from "../config/constants.js";

export function createSearchFilter(
  wkt: string,
  start: Date,
  end: Date
): FilterSchema {
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

export async function searchOverlays(
  params: FilterSchema
): Promise<ElasticProviderOverlay[]> {
  try {
    // Implementation for searching overlays using the provided filter schema
    const url = ELASTIC_PROVIDER_URL;
    const response = await axios.post(url, params);

    // Convert response to ElasticProviderOverlay[]
    const overlays: ElasticProviderOverlay[] = response.data || [];
    return overlays;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Elastic provider failed because ${message}`);
  }
}
