/**
 * Project Link Generator
 * Single Responsibility: Generate project links from overlay IDs
 */

import type { Site } from "@homevisit/common";
import type { ElasticProviderOverlay } from "@homevisit/common/src/index.ts";
import { PROJECT_LINK_FORMAT } from "../config/constants.ts";
import { logger } from "../middleware/logger.ts";

/**
 * Generate project link URL using configured format
 * Extracts overlay entity IDs and substitutes them into the PROJECT_LINK_FORMAT
 */
export function createProjectLink(
  site: Site,
  overlays: ElasticProviderOverlay[]
): string {
  try {
    if (overlays.length === 0) {
      return PROJECT_LINK_FORMAT.replace("{overlayIds}", "");
    }

    const overlayIds = overlays
      .map((o) => `\\\\\\"${o.exclusive_id.entity_id}\\\\\\"`)
      .join(",");

    return PROJECT_LINK_FORMAT.replace("{overlayIds}", overlayIds);
  } catch (error) {
    logger.error("Error creating project link", error);
    return "";
  }
}
