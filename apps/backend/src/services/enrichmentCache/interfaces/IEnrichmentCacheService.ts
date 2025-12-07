/**
 * Interface for Enrichment Cache Service
 */

import type { CachedGroupEnrichment } from "@homevisit/common";

export interface IEnrichmentCacheService {
  get(groupName: string): CachedGroupEnrichment | undefined;
  set(groupName: string, data: CachedGroupEnrichment): void;
  has(groupName: string): boolean;
  delete(groupName: string): void;
  clear(): void;
  getStats(): { keys: number; hits: number; misses: number };
}
