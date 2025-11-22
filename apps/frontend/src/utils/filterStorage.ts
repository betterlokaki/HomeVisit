/**
 * localStorage utilities for persisting filter state
 */

import type { SiteFilters } from "../stores/visitStore";

const STORAGE_KEY = "homevisit_filters";

/**
 * Save filters to localStorage
 */
export function saveFilters(filters: SiteFilters): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error("Failed to save filters to localStorage:", error);
  }
}

/**
 * Load filters from localStorage
 */
export function loadFilters(): SiteFilters | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as SiteFilters;
  } catch (error) {
    console.error("Failed to load filters from localStorage:", error);
    return null;
  }
}

/**
 * Clear filters from localStorage
 */
export function clearFilters(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear filters from localStorage:", error);
  }
}
