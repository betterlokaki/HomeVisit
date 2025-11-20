<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { VisitCard } from '../stores/visitStore';

  export let card: VisitCard;

  const dispatch = createEventDispatcher();
  
  // Handlers for visit actions
  async function onCancel(cardId: number) {
    console.log('Clicked: Cancel for card', cardId);
    dispatch('cancel', cardId);
  }

  async function onComplete(cardId: number) {
    console.log('Clicked: Complete for card', cardId);
    dispatch('complete', cardId);
  }

  async function onPartial(cardId: number) {
    console.log('Clicked: Partial for card', cardId);
    dispatch('partial', cardId);
  }

  async function onReturn(cardId: number) {
    console.log('Clicked: Return for card', cardId);
    dispatch('return', cardId);
  }

  // Determine card styling based on status
  $: statusConfig = {
    'Active': {
      borderColor: 'border-[#1668dc]',
      bgColor: 'bg-[#1f1f1f]',
      actionButtons: ['cancel', 'partial', 'complete']
    },
    'No Collection': {
      borderColor: 'border-[#d32029]',
      bgColor: 'bg-[#2a1215]',
      actionButtons: ['cancel', 'complete']
    },
    'Awaiting': {
      borderColor: 'border-[#d89614]',
      bgColor: 'bg-[#2b2111]',
      actionButtons: ['cancel', 'return']
    },
    'Completed': {
      borderColor: 'border-[#15b26d]',
      bgColor: 'bg-[#1a2b21]',
      actionButtons: []
    },
    'Partial': {
      borderColor: 'border-[#0099ff]',
      bgColor: 'bg-[#1a2a3f]',
      actionButtons: ['cancel', 'complete']
    }
  };

  $: config = statusConfig[card.updatedStatus] || statusConfig['Awaiting'];

  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  }

  // Get Hebrew status text
  function getHebrewStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'Active': 'פעיל',
      'No Collection': 'ללא איסוף',
      'Awaiting': 'בהמתנה',
      'Completed': 'הושלם',
      'Partial': 'חלקי'
    };
    return statusMap[status] || status;
  }

  function handleKeyDown(event: KeyboardEvent, handler: () => void) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handler();
    }
  }
</script>

<!-- Visit Card -->
<div 
  class={`${config.bgColor} border ${config.borderColor} border-solid relative rounded-[8px] shrink-0 w-full shadow-md hover:shadow-lg transition-shadow`}
>
  <div class="box-border flex flex-col gap-[8px] items-end overflow-clip p-[16px] relative rounded-[inherit] w-full" dir="rtl">
    
    <!-- Card Header -->
    <div class="flex gap-[12px] items-center justify-between w-full">
      <div class="flex flex-col gap-[4px] items-end flex-1">
        <h3 class="text-[16px] font-bold text-white">{card.site_name}</h3>
        <p class="text-[12px] text-[#ffffffe0]">
          אתר ID: {card.site_id}
        </p>
      </div>
      <div class="px-[8px] py-[4px] bg-[rgba(255,255,255,0.1)] rounded-[4px]">
        <span class="text-[12px] font-semibold text-white">
          {getHebrewStatus(card.updatedStatus)}
        </span>
      </div>
    </div>

    <!-- Divider -->
    <div class="w-full h-px bg-[#434343]" />

    <!-- Card Content -->
    <div class="flex flex-col gap-[8px] w-full">
      <div class="flex justify-between text-[12px]">
        <span class="text-[#ffffffe0]">תאריך בדיקה:</span>
        <span class="text-white font-medium">{formatDate(card.seen_date)}</span>
      </div>
      
      <div class="flex justify-between text-[12px]">
        <span class="text-[#ffffffe0]">סטטוס נראה:</span>
        <span class="text-white font-medium">{card.seen_status}</span>
      </div>

      <div class="flex justify-between text-[12px]">
        <span class="text-[#ffffffe0]">קבוצה:</span>
        <span class="text-white font-medium">קבוצה #{card.group_id}</span>
      </div>
    </div>

    <!-- Divider -->
    <div class="w-full h-px bg-[#434343]" />

    <!-- Action Buttons -->
    <div class="flex gap-[8px] items-center justify-end w-full flex-wrap">
      {#if config.actionButtons.includes('cancel')}
        <button
          on:click={() => onCancel(card.site_id)}
          on:keydown={(e) => handleKeyDown(e, () => onCancel(card.site_id))}
          class="px-[12px] py-[6px] rounded-[4px] text-[12px] font-semibold bg-[#434343] hover:bg-[#555555] text-white transition-colors active:scale-95"
        >
          ביטול
        </button>
      {/if}

      {#if config.actionButtons.includes('return')}
        <button
          on:click={() => onReturn(card.site_id)}
          on:keydown={(e) => handleKeyDown(e, () => onReturn(card.site_id))}
          class="px-[12px] py-[6px] rounded-[4px] text-[12px] font-semibold bg-[#d89614] hover:bg-[#f0a820] text-white transition-colors active:scale-95"
        >
          חזור
        </button>
      {/if}

      {#if config.actionButtons.includes('partial')}
        <button
          on:click={() => onPartial(card.site_id)}
          on:keydown={(e) => handleKeyDown(e, () => onPartial(card.site_id))}
          class="px-[12px] py-[6px] rounded-[4px] text-[12px] font-semibold bg-[#0099ff] hover:bg-[#1aadff] text-white transition-colors active:scale-95"
        >
          חלקי
        </button>
      {/if}

      {#if config.actionButtons.includes('complete')}
        <button
          on:click={() => onComplete(card.site_id)}
          on:keydown={(e) => handleKeyDown(e, () => onComplete(card.site_id))}
          class="px-[12px] py-[6px] rounded-[4px] text-[12px] font-semibold bg-[#15b26d] hover:bg-[#1abc7b] text-white transition-colors active:scale-95"
        >
          הגש
        </button>
      {/if}
    </div>

    <!-- Link Button -->
    <a
      href={card.siteLink}
      target="_blank"
      rel="noopener noreferrer"
      class="text-[12px] text-[#1668dc] hover:text-[#1f76ff] font-semibold underline transition-colors w-full text-right"
    >
      פתח בפרויקט →
    </a>
  </div>
</div>

<style>
  :global(body) {
    direction: rtl;
  }
</style>
