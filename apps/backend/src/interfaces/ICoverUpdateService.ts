/**
 * Interface for Cover Update Service
 */

import type { CoverUpdateEntry } from "@homevisit/common";

export interface ICoverUpdateService {
  getCoverUpdates(
    geometry: string,
    refreshTimeMs: number
  ): Promise<CoverUpdateEntry[]>;
}
