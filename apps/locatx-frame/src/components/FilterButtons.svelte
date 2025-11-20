<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let selectedFilters = {
    awaiting: false,
    collected: false,
    completed: false
  };

  async function handleInspectorClick() {
    console.log('Clicked: Inspector dropdown');
    dispatch('inspectorSelect', 'מעריך');
  }

  async function toggleFilter(filterName: keyof typeof selectedFilters) {
    selectedFilters[filterName] = !selectedFilters[filterName];
    console.log('Clicked: Filter toggled -', filterName);
    dispatch('filterToggle', filterName);
  }

  function handleKeyDown(event: KeyboardEvent, handler: () => void) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handler();
    }
  }
</script>

<!-- Filter Section -->
<div 
  class="flex gap-[12px] items-start justify-end relative shrink-0" 
  dir="rtl"
>
  <!-- Inspector Dropdown -->
  <div 
    class="flex flex-col gap-[16px] h-[32px] items-end justify-center relative shrink-0" 
    data-name="Inspector Menu"
  >
    <button
      on:click={handleInspectorClick}
      on:keydown={(e) => handleKeyDown(e, handleInspectorClick)}
      class="bg-[#1668dc] hover:bg-[#1f76ff] text-white px-[16px] py-[6px] rounded-[8px] text-[12px] font-semibold transition-colors active:scale-95 flex items-center gap-[8px]"
    >
      <span>מעריך</span>
      <span>⌄</span>
    </button>
  </div>

  <!-- Filter Buttons -->
  <button
    on:click={() => toggleFilter('awaiting')}
    on:keydown={(e) => handleKeyDown(e, () => toggleFilter('awaiting'))}
    class={`box-border flex gap-[8px] h-[32px] items-center justify-center px-[12px] py-0 relative rounded-[8px] shrink-0 cursor-pointer transition-all text-[12px] font-semibold ${
      selectedFilters.awaiting
        ? 'bg-[#1668dc] text-white'
        : 'bg-[#131c17] text-[#ffffffe0] hover:bg-[#1a241e]'
    }`}
  >
    בהמתנה
  </button>

  <button
    on:click={() => toggleFilter('collected')}
    on:keydown={(e) => handleKeyDown(e, () => toggleFilter('collected'))}
    class={`box-border flex gap-[8px] h-[32px] items-center justify-center px-[12px] py-0 relative rounded-[8px] shrink-0 cursor-pointer transition-all text-[12px] font-semibold ${
      selectedFilters.collected
        ? 'bg-[#1668dc] text-white'
        : 'bg-[#131c17] text-[#ffffffe0] hover:bg-[#1a241e]'
    }`}
  >
    אסוף
  </button>

  <button
    on:click={() => toggleFilter('completed')}
    on:keydown={(e) => handleKeyDown(e, () => toggleFilter('completed'))}
    class={`box-border flex gap-[8px] h-[32px] items-center justify-center px-[12px] py-0 relative rounded-[8px] shrink-0 cursor-pointer transition-all text-[12px] font-semibold ${
      selectedFilters.completed
        ? 'bg-[#1668dc] text-white'
        : 'bg-[#131c17] text-[#ffffffe0] hover:bg-[#1a241e]'
    }`}
  >
    הושלם
  </button>
</div>

<style>
  div {
    direction: rtl;
  }
</style>
