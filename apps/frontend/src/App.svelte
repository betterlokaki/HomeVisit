<!-- 
  LocatX Frame - Site Visit Management Interface
  Refactored with modular components and proper RTL layout
-->

<script lang="ts">
  import { onMount } from "svelte";
  import MapContainer from "./components/MapContainer.svelte";
  import TicketsPanel from "./components/TicketsPanel.svelte";
  import Header from "./components/Header.svelte";
  import { visitStore } from "./stores/visitStore";
  import { loadFilters } from "./utils/filterStorage";

  let cardData: any[] = [];
  let isLoading = false;
  let selectedSiteId: number | null = null;

  // Calculate progress: sites with seen_status = "Seen" are considered done
  $: completedCount = cardData.filter(
    (card) => card.seen_status === "Seen"
  ).length;
  $: totalCount = cardData.length;
  $: progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
  class="flex flex-col w-full h-screen"
  style="background-color: #1A1A1A;"
  dir="rtl"
>
  <!-- Full Width Header -->
  <div class="shrink-0 p-2 pb-0" style="background-color: #1A1A1A;">
    <Header />

    <!-- Progress Bar - Full Width -->
    <div class="mt-2 px-1">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs text-gray-400">התקדמות ביקורים</span>
        <span class="text-xs font-bold text-blue-400">{progressPercent}%</span>
      </div>
      <div
        class="w-full h-2 rounded-full overflow-hidden"
        style="background-color: #434343;"
      >
        <div
          class="h-full rounded-full transition-all duration-500 ease-out"
          style="width: {progressPercent}%; background-color: #3B82F6;"
        ></div>
      </div>
      <div class="flex items-center justify-between mt-1">
        <span class="text-xs text-gray-500"
          >{completedCount} מתוך {totalCount} הושלמו</span
        >
      </div>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="flex gap-[4px] items-stretch justify-end flex-1 overflow-hidden">
    <!-- Tickets Panel (Right) - 1/3 width -->
    <div class="w-1/3 h-full flex-shrink-0 overflow-hidden">
      <TicketsPanel
        cards={cardData}
        loading={isLoading}
        on:cardSelect={(e) => (selectedSiteId = e.detail)}
      />
    </div>

    <!-- Map Container (Left) - 2/3 width -->
    <div
      class="w-2/3 h-full box-border content-stretch flex flex-col gap-[24px] items-end overflow-clip p-[12px] flex-shrink-0"
      style="background-color: #1A1A1A;"
    >
      <MapContainer bind:selectedSiteId />
    </div>
  </div>
</div>

<style>
  /* Local Heebo font - Hebrew subset */
  @font-face {
    font-family: "Heebo";
    font-style: normal;
    font-weight: 400 700;
    font-display: swap;
    src: url("/fonts/heebo-hebrew.woff2") format("woff2");
    unicode-range: U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC,
      U+FB1D-FB4F;
  }

  /* Local Heebo font - Latin subset */
  @font-face {
    font-family: "Heebo";
    font-style: normal;
    font-weight: 400 700;
    font-display: swap;
    src: url("/fonts/heebo-latin.woff2") format("woff2");
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
      U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191,
      U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }

  :global(html) {
    direction: rtl;
  }

  :global(body) {
    font-family: "Heebo", sans-serif;
    margin: 0;
    padding: 0;
    background-color: #1a1a1a;
    color: #ffffffe0;
    direction: rtl;
  }
</style>
