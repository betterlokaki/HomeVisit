<!-- 
  LocatX Frame - Site Visit Management Interface
  Refactored with modular components and proper RTL layout
-->

<script lang="ts">
  import { onMount } from "svelte";
  import MapContainer from "./components/MapContainer.svelte";
  import TicketsPanel from "./components/TicketsPanel.svelte";
  import { visitStore } from "./stores/visitStore";
  import { loadFilters } from "./utils/filterStorage";

  let cardData: any[] = [];
  let isLoading = false;
  let selectedSiteId: number | null = null;

  onMount(async () => {
    // Load initial filters from localStorage
    const savedFilters = loadFilters();
    if (savedFilters) {
      await visitStore.updateFilters(savedFilters);
    } else {
      // Load without filters on first visit
      await visitStore.loadVisitCards();
    }
  });

  // Subscribe to the visit store
  visitStore.subscribe((state: any) => {
    cardData = state.cards;
    isLoading = state.loading;
  });
</script>

<!-- Root Container - RTL Layout with Dark Theme -->
<div
  class="content-stretch flex gap-[4px] items-stretch justify-end relative size-full min-h-screen w-full bg-black"
  dir="rtl"
>
  <!-- Tickets Panel (Right) - 50% width -->
  <div class="w-1/2 flex-shrink-0">
    <TicketsPanel
      cards={cardData}
      loading={isLoading}
      on:cardSelect={(e) => (selectedSiteId = e.detail)}
    />
  </div>

  <!-- Map Container (Left) - 50% width -->
  <div
    class="bg-gray-900 box-border content-stretch flex flex-col gap-[24px] h-full items-end min-h-px min-w-px overflow-clip p-[12px] relative rounded-lg w-1/2 flex-shrink-0"
  >
    <MapContainer bind:selectedSiteId />
  </div>
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap");

  :global(html) {
    direction: rtl;
  }

  :global(body) {
    font-family: "Heebo", sans-serif;
    margin: 0;
    padding: 0;
    background-color: #000000;
    color: #ffffffe0;
    direction: rtl;
  }
</style>
