/**
 * CSV Exporter Utility
 * Single Responsibility: Convert JSON data to CSV format and trigger download
 */

/**
 * Escape CSV field value (handles commas, quotes, newlines)
 */
function escapeCsvField(value: string | number | undefined | null): string {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  // Always wrap in quotes to prevent Excel from interpreting as formula
  // and escape any existing quotes
  return `"${stringValue.replace(/"/g, '""')}"`;
}

/**
 * Convert array of objects to CSV string
 * @param data Array of objects where keys become column headers
 * @returns CSV string
 */
export function jsonToCsv(data: Record<string, string | number>[]): string {
  if (data.length === 0) {
    return "";
  }

  // Get all unique keys from all objects
  const headers = Array.from(new Set(data.flatMap((obj) => Object.keys(obj))));

  // Build CSV rows
  const rows: string[] = [];

  // Header row
  rows.push(headers.map(escapeCsvField).join(","));

  // Data rows
  for (const obj of data) {
    const row = headers.map((header) => {
      const value = obj[header];
      return escapeCsvField(value !== undefined ? String(value) : "");
    });
    rows.push(row.join(","));
  }

  return rows.join("\n");
}

/**
 * Download CSV file
 * @param csvContent CSV string content
 * @param filename Filename for the downloaded file
 */
export function downloadCsv(csvContent: string, filename: string): void {
  // Add BOM for UTF-8 to ensure Excel opens it correctly
  const BOM = "\uFEFF";
  // Use UTF-8 encoding explicitly
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
