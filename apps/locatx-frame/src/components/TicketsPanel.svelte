<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import VisitCard from './VisitCard.svelte';
  import FilterButtons from './FilterButtons.svelte';
  import type { VisitCard as VisitCardType } from '../stores/visitStore';

  export let cards: VisitCardType[] = [];
  export let loading: boolean = false;

  const dispatch = createEventDispatcher();

  // Handlers for visit card actions
  async function handleCancel(cardId: number) {
    console.log('Clicked: Cancel for card', cardId);
  }

  async function handleComplete(cardId: number) {
    console.log('Clicked: Complete for card', cardId);
  }

  async function handlePartial(cardId: number) {
    console.log('Clicked: Partial for card', cardId);
  }

  async function handleReturn(cardId: number) {
    console.log('Clicked: Return for card', cardId);
  }

  // Filter handlers
  async function handleInspectorSelect(inspector: string) {
    console.log('Clicked: Inspector selected -', inspector);
    dispatch('inspectorSelect', inspector);
  }

  async function handleFilterToggle(filter: string) {
    console.log('Clicked: Filter toggled -', filter);
    dispatch('filterToggle', filter);
  }
</script>

<!-- Tickets Panel - Right Side -->
<div 
  class="bg-[#141414] box-border flex flex-col gap-[24px] h-full items-end overflow-auto p-[12px] relative rounded-[8px] shrink-0 max-w-[954px] w-full flex-1 min-h-[600px]" 
  dir="rtl"
>
  <!-- Title Section -->
  <div 
    class="flex flex-col gap-[10px] items-end justify-center shrink-0 w-full sticky top-0 bg-[#141414] z-10 pb-[12px]"
  >
    <div 
      class="flex gap-[24px] items-center relative shrink-0 w-full"
    >
      <h2 class="text-[20px] font-bold text-white">
        ביקורי אתרים
      </h2>
      <span class="text-[14px] text-[#ffffffe0]">
        {cards.length} אתרים
      </span>
    </div>

    <!-- Filter Section -->
    <FilterButtons 
      on:inspectorSelect={async (e) => handleInspectorSelect(e.detail)}
      on:filterToggle={async (e) => handleFilterToggle(e.detail)}
    />
  </div>

  <!-- Loading State -->
  {#if loading}
    <div class="flex flex-col gap-[16px] items-center justify-center w-full py-[40px]">
      <div class="animate-spin">
        <div class="w-[40px] h-[40px] border-4 border-[#434343] border-t-[#1668dc] rounded-full" />
      </div>
      <p class="text-[14px] text-[#ffffffe0]">טוען נתונים...</p>
    </div>
  {/if}

  <!-- Visit Cards List -->
  {#if !loading && cards.length > 0}
    <div class="flex flex-col gap-[12px] w-full">
      {#each cards as card (card.site_id)}
        <VisitCard 
          {card}
          on:cancel={async (e) => handleCancel(e.detail)}
          on:complete={async (e) => handleComplete(e.detail)}
          on:partial={async (e) => handlePartial(e.detail)}
          on:return={async (e) => handleReturn(e.detail)}
        />
      {/each}
    </div>
  {/if}

  <!-- Empty State -->
  {#if !loading && cards.length === 0}
    <div class="flex flex-col gap-[16px] items-center justify-center w-full py-[60px]">
      <div class="text-[48px]">📭</div>
      <p class="text-[16px] font-semibold text-white">אין ביקורים להצגה</p>
      <p class="text-[14px] text-[#ffffffe0]">אנא נסה לעדכן את הסינון</p>
    </div>
  {/if}
</div>

<style>
  div {
    direction: rtl;
  }
</style>
