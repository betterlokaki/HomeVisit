/**
 * Date key helper - converts dates to YYYY-MM-DD format
 */

export function toDateKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}
