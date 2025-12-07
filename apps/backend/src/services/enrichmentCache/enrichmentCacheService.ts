/**
 * Enrichment Cache Service
 * Wraps node-cache to store enrichment data per group
 */

import NodeCache from "node-cache";
import type { CachedGroupEnrichment } from "@homevisit/common";
import type { IEnrichmentCacheService } from "./interfaces/IEnrichmentCacheService.ts";
import { logger } from "../../middleware/logger.ts";

export class EnrichmentCacheService implements IEnrichmentCacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 0, // No auto-expiration, we manage refresh manually
      checkperiod: 0, // No periodic check needed
      useClones: false, // Better performance, we store immutable data
    });

    this.cache.on("set", (key) => {
      logger.info(`📦 Cache SET: ${key}`);
    });

    this.cache.on("del", (key) => {
      logger.info(`🗑️ Cache DEL: ${key}`);
    });
  }

  get(groupName: string): CachedGroupEnrichment | undefined {
    const data = this.cache.get<CachedGroupEnrichment>(groupName);
    if (data) {
      logger.debug(`✅ Cache HIT: ${groupName}`);
    } else {
      logger.debug(`❌ Cache MISS: ${groupName}`);
    }
    return data;
  }

  set(groupName: string, data: CachedGroupEnrichment): void {
    this.cache.set(groupName, data);
  }

  has(groupName: string): boolean {
    return this.cache.has(groupName);
  }

  delete(groupName: string): void {
    this.cache.del(groupName);
  }

  clear(): void {
    this.cache.flushAll();
    logger.info("🧹 Cache cleared");
  }

  getStats(): { keys: number; hits: number; misses: number } {
    const stats = this.cache.getStats();
    return {
      keys: stats.keys,
      hits: stats.hits,
      misses: stats.misses,
    };
  }
}
