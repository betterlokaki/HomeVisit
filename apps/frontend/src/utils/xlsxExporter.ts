/**
 * XLSX Exporter Utility
 * Single Responsibility: Convert JSON data to XLSX format with RTL, colors, and proper date formatting
 */

import ExcelJS from "exceljs";
import type { VisitCard } from "../stores/visit/VisitCard";
import type { MergedHistoryResponse } from "@homevisit/common";
import dayjs from "dayjs";

/**
 * Status color mapping (RGB hex to ExcelJS color format)
 */
const STATUS_COLORS: Record<string, string> = {
  בוקר: "#4ade80", // Green - Seen
  "מחכה לביקור": "#facc15", // Yellow - Not Seen / Partial Cover
  "בוקר חלקית": "#fbbf24", // Yellow-Orange - Partial Seen
  "אין כיסוי": "#ef4444", // Red - Not Cover
  "אין מידע": "#6b7280", // Gray - No data
};

/**
 * Get cell background color based on status text
 */
function getStatusColor(statusText: string): string {
  return STATUS_COLORS[statusText] || "#ffffff";
}

/**
 * Generate date range from 30 days ago to today
 * @returns Array of date strings in YYYY-MM-DD format
 */
function generateDateRange(): string[] {
  const dates: string[] = [];
  const today = dayjs();

  for (let i = 30; i >= 0; i--) {
    const date = today.subtract(i, "day");
    dates.push(date.format("YYYY-MM-DD"));
  }

  return dates;
}

/**
 * Format date to localized format (DD/MM/YYYY) for display
 */
function formatLocalizedDate(dateString: string): string {
  return dayjs(dateString).format("DD/MM/YYYY");
}

/**
 * Translate merged status to Hebrew
 */
function translateMergedStatus(mergedStatus: string): string {
  const translations: Record<string, string> = {
    "Not Cover": "אין כיסוי",
    "Partial Seen": "בוקר חלקית",
    Seen: "בוקר",
    "Not Seen": "מחכה לביקור",
    "Partial Cover": "מחכה לביקור",
  };

  return translations[mergedStatus] || mergedStatus;
}

/**
 * Build XLSX workbook from sites and history data
 * @param sites Array of all sites
 * @param historyMap Map of siteId -> MergedHistoryResponse
 * @returns ExcelJS Workbook
 */
export async function buildXlsxWorkbook(
  sites: VisitCard[],
  historyMap: Map<number, MergedHistoryResponse>
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Site Status", {
    properties: {
      defaultRowHeight: 20,
    },
    views: [
      {
        rightToLeft: true, // RTL for Hebrew
      },
    ],
  });

  const dateRange = generateDateRange();

  // Build header row
  const headers = ["אתר", ...dateRange.map(formatLocalizedDate)];
  worksheet.addRow(headers);

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } }; // White text
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1A1A1A" }, // Dark background
  };
  headerRow.alignment = {
    vertical: "middle",
    horizontal: "center", // Center alignment for dates
    wrapText: true,
  };

  // Set site name header to right alignment (RTL)
  const siteNameHeader = headerRow.getCell(1);
  siteNameHeader.alignment = {
    vertical: "middle",
    horizontal: "right", // RTL for Hebrew
    wrapText: true,
  };

  // Set column widths
  worksheet.getColumn(1).width = 25; // Site name column
  dateRange.forEach((_, index) => {
    worksheet.getColumn(index + 2).width = 15; // Date columns - wider to prevent #####
  });

  // Add data rows
  for (const site of sites) {
    const rowData: (string | Date)[] = [site.site_name || ""];

    // Get history for this site
    const history = historyMap.get(site.site_id);
    const historyByDate = new Map<string, string>();

    if (history && history.history) {
      for (const entry of history.history) {
        const normalizedDate = dayjs(entry.date).format("YYYY-MM-DD");
        const translatedStatus = entry.mergedStatus
          ? translateMergedStatus(entry.mergedStatus)
          : "אין מידע";
        historyByDate.set(normalizedDate, translatedStatus);
      }
    }

    // Add status for each date
    for (const date of dateRange) {
      const localizedDate = formatLocalizedDate(date);
      const mergedStatus = historyByDate.get(date) || "אין מידע";
      rowData.push(mergedStatus);
    }

    const row = worksheet.addRow(rowData);

    // Style the row
    row.alignment = {
      vertical: "middle",
      horizontal: "right", // RTL alignment
      wrapText: true,
    };

    // Style site name cell
    const siteNameCell = row.getCell(1);
    siteNameCell.font = { bold: true, size: 11 };
    siteNameCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2A2A2A" }, // Slightly lighter dark background
    };
    siteNameCell.font = { ...siteNameCell.font, color: { argb: "FFFFFFFF" } };

    // Style date cells with colors based on status
    dateRange.forEach((date, index) => {
      const cell = row.getCell(index + 2);
      const statusText = historyByDate.get(date) || "אין מידע";
      const color = getStatusColor(statusText);

      // Convert hex to ARGB (remove # and add FF prefix)
      const argbColor = `FF${color.substring(1)}`;

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: argbColor },
      };
      cell.font = {
        size: 10,
        color: { argb: "FF000000" }, // Black text for readability
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
    });
  }

  // Freeze header row
  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1, // Freeze first row
      rightToLeft: true,
    },
  ];

  return workbook;
}

/**
 * Download XLSX file
 * @param workbook ExcelJS Workbook
 * @param filename Filename for the downloaded file
 */
export async function downloadXlsx(
  workbook: ExcelJS.Workbook,
  filename: string
): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

/**
 * Generate filename with date range
 */
export function generateXlsxFilename(): string {
  const today = dayjs();
  const thirtyDaysAgo = today.subtract(30, "day");

  const startDate = thirtyDaysAgo.format("DD-MM-YYYY");
  const endDate = today.format("DD-MM-YYYY");

  return `site_status_${startDate}_to_${endDate}.xlsx`;
}
