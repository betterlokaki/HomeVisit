export interface DateRange {
  gte: string; // ISO datetime
  lte: string; // ISO datetime
}

export interface MatchFilter {
  type: "IN";
  values: string[];
}

export interface GeoFilter {
  type: "IN";
  values: string[];
}

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
