/**
 * Date key helper - converts dates to YYYY-MM-DD format
 * Handles timezone issues by parsing the date string directly if possible
 */

export function toDateKey(date: Date | string): string {
  // If it's a string in YYYY-MM-DD format or YYYY-MM-DDTHH:mm:ss format, extract directly
  if (typeof date === "string") {
    // If it's already in YYYY-MM-DD format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // If it's in ISO format (YYYY-MM-DDTHH:mm:ss), extract the date part
    const dateMatch = date.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return dateMatch[1];
    }
  }

  // Fallback to Date object conversion using UTC
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
