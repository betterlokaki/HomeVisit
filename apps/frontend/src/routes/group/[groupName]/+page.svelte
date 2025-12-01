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
  class="flex flex-col w-full h-screen"
  style="background-color: #1A1A1A;"
  dir="rtl"
>
  <!-- Full Width Header -->
  <header
    class="shrink-0 p-3 flex items-center justify-between w-full"
    style="background-color: #1A1A1A; border-bottom: 1px solid #434343;"
  >
    <h1 class="text-xl font-bold text-white">ניהול אתרים</h1>
  </header>

  <!-- Main Content Area -->
  <div class="flex gap-2 items-stretch justify-end flex-1 overflow-hidden p-2">
    <!-- Tickets Panel (Right) - 35% width -->
    <div class="w-[35%] h-full flex-shrink-0 overflow-hidden">
      <TicketsPanel
        {groupName}
        cards={cardData}
        loading={isLoading}
        on:cardSelect={(e) => (selectedSiteId = e.detail)}
      />
    </div>

    <!-- Map Container (Left) - 65% width -->
    <div
      class="w-[65%] h-full box-border content-stretch flex flex-col gap-6 items-end overflow-clip p-3 flex-shrink-0"
      style="background-color: #1A1A1A;"
    >
      <MapContainer bind:selectedSiteId />
    </div>
  </div>
</div>
