/**
 * Utility functions for site data enrichment
 */

const STATUS_OPTIONS = ["Full", "Partial", "No"] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

/**
 * Simulate calculating status with async operation
 * In real world, this might call an external API or perform complex calculations
 *
 * @returns Promise<StatusOption> - One of: Full, Partial, No
 */
export async function calculateStatus(): Promise<StatusOption> {
  // Simulate async operation (e.g., calling an external service)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Randomly select a status from the closed list
  const randomIndex = Math.floor(Math.random() * STATUS_OPTIONS.length);
  return STATUS_OPTIONS[randomIndex];
}

/**
 * Generate a random site link/URL
 *
 * @returns string - A randomly generated site link
 */
export function generateSiteLink(): string {
  const randomId = Math.random().toString(36).substring(2, 10);
  const randomToken = Math.random().toString(36).substring(2, 15);
  return `https://site-${randomId}-${randomToken}.homevisit.local`;
}
