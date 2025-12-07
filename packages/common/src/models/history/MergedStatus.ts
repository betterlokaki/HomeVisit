/**
 * Merged Status type - Result of merging cover status with visit status
 */

export type MergedStatus =
  | "Seen"
  | "Partial Cover"
  | "Partial Seen"
  | "Not Seen"
  | "Not Cover";
