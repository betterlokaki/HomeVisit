/**
 * Cover Update Request Builder - Builds request body with configured keys
 */

import type { CoverUpdateRequestKeys } from "../../config/types/CoverUpdateServiceConfig.ts";

/**
 * Request body structure for cover update service
 */
export interface CoverUpdateRequestBody {
  [key: string]: {
    [key: string]: string[] | number[];
  };
}

/**
 * Builds the cover update request body with configured dynamic keys
 * @param geometry - WKT geometry string
 * @param refreshTimeSeconds - Refresh time in seconds
 * @param requestKeys - Configured key names from config
 * @returns Structured request body with nested dynamic keys
 */
export function buildCoverUpdateRequest(
  geometry: string,
  refreshTimeSeconds: number,
  requestKeys: CoverUpdateRequestKeys
): CoverUpdateRequestBody {
  const {
    geometryOuterKey,
    geometryInnerKey,
    secondsOuterKey,
    secondsInnerKey,
  } = requestKeys;

  return {
    [geometryOuterKey]: {
      [geometryInnerKey]: [geometry],
    },
    [secondsOuterKey]: {
      [secondsInnerKey]: [refreshTimeSeconds],
    },
  };
}
