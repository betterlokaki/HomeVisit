<script lang="ts">
  /**
   * SiteCard Component
   *
   * Displays a single enriched site card with:
   * - Site name and editable status dropdown
   * - Updated status label (Full, Partial, No) - read-only
   * - Clickable site link button
   * - Coordinates and timestamps
   */

  import { createEventDispatcher } from "svelte";
  import type { EnrichedSite, SeenStatus } from "@homevisit/common/src";

  export let site: EnrichedSite;
  export let isSelected: boolean = false;

  let selectedStatus: SeenStatus = site.seen_status;

  const dispatch = createEventDispatcher<{
    selectSite: void;
    statusChanged: { siteId: number; newStatus: SeenStatus };
  }>();

  const statusOptions: SeenStatus[] = ["Seen", "Partial", "Not Seen"];

  const statusColors: Record<SeenStatus, string> = {
    Seen: "bg-green-100 text-green-800 border-green-300",
    Partial: "bg-amber-100 text-amber-800 border-amber-300",
    "Not Seen": "bg-red-100 text-red-800 border-red-300",
  };

  const updatedStatusColors: Record<string, string> = {
    Full: "bg-emerald-100 text-emerald-800",
    Partial: "bg-yellow-100 text-yellow-800",
    No: "bg-red-100 text-red-800",
  };

  const handleStatusChange = (newStatus: SeenStatus) => {
    selectedStatus = newStatus;
    dispatch("statusChanged", { siteId: site.site_id, newStatus });
  };

  const onStatusSelectChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    handleStatusChange(target.value as SeenStatus);
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
  <!-- Header: Name and Status Dropdown -->
  <div class="flex justify-between items-start gap-3 mb-3">
    <div class="flex-1">
      <h3 class="text-lg font-semibold text-gray-900">{site.site_name}</h3>
    </div>
    <div class="flex gap-2 flex-wrap justify-end">
      <!-- Status Dropdown (Editable) -->
      <select
        value={selectedStatus}
        on:change={onStatusSelectChange}
        on:click|stopPropagation
        on:keydown|stopPropagation
        class="px-3 py-1 rounded-full text-xs font-medium border-2 cursor-pointer transition-colors {statusColors[
          selectedStatus
        ]}"
      >
        {#each statusOptions as status}
          <option value={status} class="bg-white text-gray-900">
            {status}
          </option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Updated Status Label (Read-only) -->
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
      <span class="font-medium">Site ID:</span>
      <code class="ml-1 bg-gray-100 px-2 py-0.5 rounded text-gray-800">
        {site.site_id}
      </code>
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
