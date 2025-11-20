<script lang="ts">
  import VisitCard from "./VisitCard.svelte";
  import type { VisitCard as VisitCardType } from "../stores/visitStore";

  export let cards: VisitCardType[] = [];
  export let loading: boolean = false;

  // Track which card is currently selected
  let selectedCardId: number | null = null;

  // Handler for card selection
  function handleCardSelect(cardId: number) {
    // Toggle selection: if same card is clicked, deselect it; otherwise select the new card
    selectedCardId = selectedCardId === cardId ? null : cardId;
    console.log("Card selected:", cardId);
  }

  // Handlers for visit card actions
  async function handleCancel(cardId: number) {
    console.log("Clicked: Cancel for card", cardId);
  }

  async function handleComplete(cardId: number) {
    console.log("Clicked: Complete for card", cardId);
  }

  async function handlePartial(cardId: number) {
    console.log("Clicked: Partial for card", cardId);
  }

  async function handleReturn(cardId: number) {
    console.log("Clicked: Return for card", cardId);
  }
</script>

<!-- Tickets Panel - Right Side with Dark Theme -->
<div
  class="bg-gray-950 box-border flex flex-col gap-1.5 h-full items-end overflow-auto p-1 relative rounded-lg shrink-0 w-full flex-1"
  style="min-height: 600px;"
  dir="rtl"
>
  <!-- Title Section -->
  <div
    class="flex flex-col gap-0.75 items-end justify-center shrink-0 w-full sticky top-0 bg-gray-950 z-10 pb-0.75"
  >
    <div class="flex gap-1.5 items-center relative shrink-0 w-full">
      <h2 class="text-xl font-bold text-white">ביקורי אתרים</h2>
      <span class="text-sm text-gray-400">
        {cards.length} אתרים
      </span>
    </div>

    <!-- Filter Section -->
    <div class="flex gap-1 items-center w-full">
      <button
        class="bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-1 rounded text-sm font-semibold transition-colors"
        >יוזר</button
      >
      <button
        class="bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-1 rounded text-sm font-semibold transition-colors"
        >מחכה לביקור</button
      >
      <button
        class="bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-1 rounded text-sm font-semibold transition-colors"
        >דרוש לאיסוף</button
      >
      <button
        class="bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-1 rounded text-sm font-semibold transition-colors"
        >בוצע</button
      >
      <button
        class="bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-1 rounded text-sm font-semibold transition-colors"
        >בוצע חלקית</button
      >
    </div>
  </div>

  <!-- Loading State -->
  {#if loading}
    <div class="flex flex-col gap-1 items-center justify-center w-full py-2.5">
      <div class="animate-spin">
        <div
          class="w-10 h-10 border-4 border-gray-800 border-t-blue-600 rounded-full"
        />
      </div>
      <p class="text-sm text-gray-400">טוען נתונים...</p>
    </div>
  {/if}

  <!-- Visit Cards List -->
  {#if !loading && cards.length > 0}
    <div class="flex flex-col gap-1 w-full">
      {#each cards as card (card.site_id)}
        <VisitCard
          {card}
          isSelected={selectedCardId === card.site_id}
          on:cancel={async (e) => handleCancel(e.detail)}
          on:select={(e) => handleCardSelect(e.detail)}
          on:complete={async (e) => handleComplete(e.detail)}
          on:partial={async (e) => handlePartial(e.detail)}
          on:return={async (e) => handleReturn(e.detail)}
        />
      {/each}
    </div>
  {/if}

  <!-- Empty State -->
  {#if !loading && cards.length === 0}
    <div class="flex flex-col gap-1 items-center justify-center w-full py-4">
      <div class="text-6xl">📭</div>
      <p class="text-base font-semibold text-white">אין ביקורים להצגה</p>
      <p class="text-sm text-gray-400">אנא נסה לעדכן את הסינון</p>
    </div>
  {/if}
</div>
