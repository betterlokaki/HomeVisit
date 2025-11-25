<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import MapContainer from "../../../components/MapContainer.svelte";
  import TicketsPanel from "../../../components/TicketsPanel.svelte";
  import { visitStore } from "../../../stores/visitStore";
  import { loadFilters } from "../../../utils/filterStorage";

  let cardData: any[] = [];
  let isLoading = false;
  let selectedSiteId: number | null = null;
  let groupName: string = "Weekly Refresh Group";

  onMount(async () => {
    // Get group name from URL params
    groupName = ($page.params.groupName as string) || "Weekly Refresh Group";
    console.log("Setting group to:", groupName);
    visitStore.setGroup(groupName);

    // Load initial filters from localStorage
    const savedFilters = loadFilters();
    if (savedFilters) {
      await visitStore.updateFilters(savedFilters);
    } else {
      // Load without filters on first visit
      await visitStore.loadVisitCards();
    }
  });

  // React to group parameter changes in the URL
  $: {
    const newGroupName =
      ($page.params.groupName as string) || "Weekly Refresh Group";
    if (newGroupName !== groupName && newGroupName) {
      console.log("Group param changed from", groupName, "to", newGroupName);
      groupName = newGroupName;
      visitStore.setGroup(newGroupName);
      // Load cards for the new group without saved filters
      visitStore.loadVisitCards();
    }
  }

  // Subscribe to the visit store
  visitStore.subscribe((state: any) => {
    cardData = state.cards;
    isLoading = state.loading;
  });
</script>

<!-- Root Container - RTL Layout with Dark Theme -->
<div
  class="flex gap-[4px] items-stretch justify-end relative w-full h-screen bg-black"
  dir="rtl"
>
  <!-- Tickets Panel (Right) - 1/3 width -->
  <div class="w-1/3 h-full flex-shrink-0 overflow-hidden">
    <TicketsPanel
      {groupName}
      cards={cardData}
      loading={isLoading}
      on:cardSelect={(e) => (selectedSiteId = e.detail)}
    />
  </div>

  <!-- Map Container (Left) - 2/3 width -->
  <div
    class="w-2/3 h-full bg-gray-900 box-border content-stretch flex flex-col gap-[24px] items-end overflow-clip p-[12px] flex-shrink-0"
  >
    <MapContainer bind:selectedSiteId />
  </div>
</div>
