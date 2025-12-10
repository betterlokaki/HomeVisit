/**
 * Status Display Utilities
 * Single Responsibility: Status text and color mapping for UI
 */

interface StatusDisplay {
  text: string;
  borderColor: string;
  textColor: string;
}

const STATUS_MAP: Record<string, StatusDisplay> = {
  "Not Seen": {
    text: "מחכה לביקור",
    borderColor: "border-yellow-400",
    textColor: "text-yellow-400",
  },
  Partial: {
    text: "בוצע חלקית",
    borderColor: "border-orange-400",
    textColor: "text-orange-400",
  },
  Seen: {
    text: "בוצע",
    borderColor: "border-green-400",
    textColor: "text-green-400",
  },
  "Not Done": {
    text: "מחכה לביקור",
    borderColor: "border-red-400",
    textColor: "text-red-400",
  },
};

const NO_COLLECTION_STATUS: StatusDisplay = {
  text: "אין איסוף",
  borderColor: "border-red-500",
  textColor: "text-red-500",
};

/**
 * Get Hebrew status text and colors for seen_status
 */
export function getSeenStatusDisplay(status: string): StatusDisplay {
  return STATUS_MAP[status] || STATUS_MAP["Not Seen"];
}

/**
 * Get updated status display based on updatedStatus field
 * When viewing history, mergedStatus should be used if available
 */
export function getUpdatedStatusDisplay(
  updatedStatus: string,
  seenStatus: string,
  mergedStatus?: string
): StatusDisplay {
  // ALWAYS check mergedStatus first if provided - this is the source of truth from history
  // mergedStatus takes absolute priority over everything else
  if (mergedStatus) {
    switch (mergedStatus) {
      case "Seen":
        return STATUS_MAP["Seen"];
      case "Partial Seen":
        return STATUS_MAP["Partial"];
      case "Not Seen":
      case "Partial Cover":
        // Both "Not Seen" and "Partial Cover" mean waiting for visit
        return STATUS_MAP["Not Seen"];
      case "Not Cover":
        return NO_COLLECTION_STATUS;
      default:
        // Default to "מחכה לביקור" for any unknown mergedStatus
        return STATUS_MAP["Not Seen"];
    }
  }

  // For current data (no mergedStatus), check coverStatus first
  if (updatedStatus === "No") {
    return NO_COLLECTION_STATUS;
  }

  // Fallback to seenStatus for current data
  return getSeenStatusDisplay(seenStatus);
}

/**
 * Format date to Hebrew locale
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
