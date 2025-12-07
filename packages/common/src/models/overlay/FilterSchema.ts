/**
 * Filter Schema for overlay search
 */

import type { DateRange } from "./DateRange.js";
import type { MatchFilter } from "./MatchFilter.js";
import type { GeoFilter } from "./GeoFilter.js";

export interface FilterSchema {
  filter: {
    logical_operators: {
      AND: Array<{
        match?: {
          ImagingTechnique: MatchFilter;
        };
        geo_intersect?: {
          geo: GeoFilter;
        };
      }>;
    };
    range: {
      date: {
        type: "IN";
        values: DateRange[];
      };
    };
  };
  sort: {
    date: "desc" | "asc";
  };
}
