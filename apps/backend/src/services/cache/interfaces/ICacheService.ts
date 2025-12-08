/**
 * Generic Cache Service Interface
 * Reusable interface for any cache implementation
 */

export interface ICacheService<T> {
  get(key: string): T | undefined;
  set(key: string, data: T): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
  getStats(): { keys: number; hits: number; misses: number };
}
