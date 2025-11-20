<!-- 
  LocatX Frame - Site Visit Management Interface
  Refactored with modular components and proper RTL layout
-->

<script lang="ts">
  import { onMount } from "svelte";
  import MapContainer from "./components/MapContainer.svelte";
  import TicketsPanel from "./components/TicketsPanel.svelte";
  import { visitStore } from "./stores/visitStore";

  let cardData: any[] = [];
  let isLoading = false;

  onMount(async () => {
    await visitStore.loadVisitCards();
  });

  // Subscribe to the visit store
  visitStore.subscribe((state: any) => {
    cardData = state.cards;
    isLoading = state.loading;
  });

  // Marker click handler
  async function handleMarkerClick(markerId: string) {
    console.log("Clicked: Marker -", markerId);
  }
</script>

<!-- Root Container - RTL Layout with Dark Theme -->
<div
  class="content-stretch flex gap-[24px] items-stretch justify-end relative size-full min-h-screen w-full bg-black"
  dir="rtl"
>
  <!-- Tickets Panel (Right) - fixed width -->
  <div
    class="bg-gray-950 box-border content-stretch flex flex-col gap-[24px] h-full items-end overflow-clip p-[12px] relative rounded-lg shrink-0 w-[954px]"
  >
    <TicketsPanel cards={cardData} loading={isLoading} />
  </div>

  <!-- Map Container (Left) - flex-1 -->
  <div
    class="bg-gray-900 box-border content-stretch flex flex-[1_0_0] flex-col gap-[24px] h-full items-end min-h-px min-w-px overflow-clip p-[12px] relative rounded-lg shrink-0"
  >
    <MapContainer on:markerClick={async (e) => handleMarkerClick(e.detail)} />
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
