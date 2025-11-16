<script lang="ts">
  /**
   * SiteCard Component
   *
   * Displays a single enriched site card with:
   * - Site name and current status badge
   * - Updated status label (Full, Partial, No)
   * - Clickable site link button
   * - Coordinates and timestamps
   */

  import { createEventDispatcher } from "svelte";
  import type { EnrichedSite } from "@homevisit/common/src";

  export let site: EnrichedSite;
  export let isSelected: boolean = false;

  const dispatch = createEventDispatcher<{
    selectSite: void;
  }>();

  const statusColors: Record<string, string> = {
    online: "bg-green-100 text-green-800",
    offline: "bg-red-100 text-red-800",
    maintenance: "bg-amber-100 text-amber-800",
  };

  const updatedStatusColors: Record<string, string> = {
    Full: "bg-emerald-100 text-emerald-800",
    Partial: "bg-yellow-100 text-yellow-800",
    No: "bg-red-100 text-red-800",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
</script>

<div
  class="p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 {isSelected
    ? 'border-blue-500 bg-blue-50 shadow-md'
    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}"
  on:click={() => dispatch("selectSite")}
  role="button"
  tabindex="0"
  on:keydown={(e) => e.key === "Enter" && dispatch("selectSite")}
>
  <!-- Header: Name and Status Badges -->
  <div class="flex justify-between items-start gap-3 mb-3">
    <div class="flex-1">
      <h3 class="text-lg font-semibold text-gray-900">{site.name}</h3>
      <p class="text-sm text-gray-600 font-mono">{site.site_code}</p>
    </div>
    <div class="flex gap-2 flex-wrap justify-end">
      <span
        class="px-3 py-1 rounded-full text-xs font-medium {statusColors[
          site.status
        ] || statusColors.offline}"
      >
        {site.status}
      </span>
    </div>
  </div>

  <!-- Updated Status Label -->
  <div class="mb-3 flex items-center gap-2">
    <span class="text-sm font-medium text-gray-700">Updated Status:</span>
    <span
      class="px-2.5 py-1 rounded-full text-xs font-semibold {updatedStatusColors[
        site.updatedStatus
      ] || updatedStatusColors.No}"
    >
      {site.updatedStatus}
    </span>
  </div>

  <!-- Site Content -->
  <div class="mb-3 text-sm text-gray-600 space-y-1.5">
    <div>
      <span class="font-medium">Coordinates:</span>
      <code class="ml-1 bg-gray-100 px-2 py-0.5 rounded text-gray-800">
        [{site.geometry.coordinates[0].toFixed(4)}, {site.geometry.coordinates[1].toFixed(
          4
        )}]
      </code>
    </div>
    <div class="grid grid-cols-2 gap-2">
      <div>
        <span class="font-medium">Last Seen:</span>
        <p class="text-xs text-gray-500">{formatDate(site.last_seen)}</p>
      </div>
      <div>
        <span class="font-medium">Last Data:</span>
        <p class="text-xs text-gray-500">{formatDate(site.last_data)}</p>
      </div>
    </div>
  </div>

  <!-- Site Link Button -->
  <div class="border-t border-gray-200 pt-3">
    <a
      href={site.siteLink}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
    >
      <svg
        class="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
      Visit Site
    </a>
  </div>
</div>
