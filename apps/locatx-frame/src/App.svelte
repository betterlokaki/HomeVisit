<!-- 
  LocatX Frame - Site Visit Management Interface
  Refactored with modular components and proper RTL layout
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import Header from './components/Header.svelte';
  import MapContainer from './components/MapContainer.svelte';
  import TicketsPanel from './components/TicketsPanel.svelte';
  import { visitStore } from './stores/visitStore';

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
    console.log('Clicked: Marker -', markerId);
  }
</script>

<!-- Root Container - RTL Layout with Map on Left, Cards on Right -->
<div 
  class="bg-[#000000] box-border flex flex-col gap-[24px] items-end px-[24px] py-[20px] relative min-h-screen w-full overflow-auto" 
  dir="rtl"
>
  <!-- Header Component -->
  <Header />

  <!-- Main Content Area - Map (Left) + Tickets Panel (Right) -->
  <div 
    class="flex gap-[24px] items-stretch w-full max-w-[1852px]"
    dir="ltr"
  >
    <!-- Map Container (Left) - 50% width -->
    <div class="w-1/2">
      <MapContainer 
        on:markerClick={async (e) => handleMarkerClick(e.detail)}
      />
    </div>

    <!-- Tickets Panel (Right) - 50% width -->
    <div class="w-1/2">
      <TicketsPanel 
        cards={cardData}
        loading={isLoading}
      />
    </div>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap');
  
  :global(html) {
    direction: rtl;
  }

  :global(body) {
    font-family: 'Heebo', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #000000;
    color: #ffffffe0;
    direction: rtl;
  }
</style>
