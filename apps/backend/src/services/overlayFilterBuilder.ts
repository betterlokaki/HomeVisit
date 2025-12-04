/**
 * Overlay Search Filter Builder
 * Single Responsibility: Build search filter schemas for overlay queries
 */

import type { FilterSchema } from "@homevisit/common/src/models/OverlaySearch.ts";

/**
 * Create a search filter for overlay queries
 */
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
