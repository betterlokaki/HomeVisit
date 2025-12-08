/**
 * Generic Cache Service
 * Reusable cache implementation using node-cache
 */

import NodeCache from "node-cache";
import type { ICacheService } from "./interfaces/ICacheService.ts";
import { logger } from "../../middleware/logger.ts";

export class GenericCacheService<T> implements ICacheService<T> {
  private cache: NodeCache;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.cache = new NodeCache({
      stdTTL: 0, // No auto-expiration, we manage refresh manually
      checkperiod: 0, // No periodic check needed
      useClones: false, // Better performance, we store immutable data
    });

    this.cache.on("set", (key) => {
      logger.info(`📦 [${this.name}] Cache SET: ${key}`);
    });

    this.cache.on("del", (key) => {
      logger.info(`🗑️ [${this.name}] Cache DEL: ${key}`);
    });
  }

  get(key: string): T | undefined {
    const data = this.cache.get<T>(key);
    if (data) {
      logger.debug(`✅ [${this.name}] Cache HIT: ${key}`);
    } else {
      logger.debug(`❌ [${this.name}] Cache MISS: ${key}`);
    }
    return data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, data);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): void {
    this.cache.del(key);
  }

  clear(): void {
    this.cache.flushAll();
    logger.info(`🧹 [${this.name}] Cache cleared`);
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
