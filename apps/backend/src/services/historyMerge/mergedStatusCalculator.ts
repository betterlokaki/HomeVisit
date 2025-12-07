/**
 * Merged status calculator - determines final status from cover + visit
 */

import type {
  UpdatedStatus,
  SeenStatus,
  MergedStatus,
} from "@homevisit/common";

export function getMergedStatus(
  coverStatus: UpdatedStatus,
  visitStatus: SeenStatus
): MergedStatus {
  if (coverStatus === "No") {
    return "Not Cover";
  }

  if (coverStatus === "Full") {
    return visitStatus === "Seen" ? "Seen" : "Not Seen";
  }

  if (coverStatus === "Partial") {
    if (visitStatus === "Partial") return "Partial Seen";
    if (visitStatus === "Not Seen") return "Partial Cover";
    return "Not Seen";
  }

  return "Not Cover";
}
