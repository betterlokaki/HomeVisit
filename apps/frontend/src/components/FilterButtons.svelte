<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let selectedFilters = {
    awaiting: false,
    collected: false,
    completed: false,
  };

  async function handleInspectorClick() {
    console.log("Clicked: Inspector dropdown");
    dispatch("inspectorSelect", "מעריך");
  }

  async function toggleFilter(filterName: keyof typeof selectedFilters) {
    selectedFilters[filterName] = !selectedFilters[filterName];
    console.log("Clicked: Filter toggled -", filterName);
    dispatch("filterToggle", filterName);
  }

  function handleKeyDown(event: KeyboardEvent, handler: () => void) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
    }
  }
</script>

<!-- Filter Section -->
<div
  class="flex gap-1.5 items-start justify-start relative shrink-0 flex-wrap"
  dir="rtl"
>
  <!-- Inspector Dropdown -->
  <div
    class="flex flex-col gap-1 h-8 items-end justify-center relative shrink-0"
    data-name="Inspector Menu"
  >
    <button
      on:click={handleInspectorClick}
      on:keydown={(e) => handleKeyDown(e, handleInspectorClick)}
      class="bg-blue-600 hover:bg-blue-500 text-white px-1 py-0.5 rounded-lg text-xs font-semibold transition-colors active:scale-95 flex items-center gap-0.5"
    >
      <span>מעריך</span>
      <span>⌄</span>
    </button>
  </div>

  <!-- Filter Buttons -->
  <button
    on:click={() => toggleFilter("awaiting")}
    on:keydown={(e) => handleKeyDown(e, () => toggleFilter("awaiting"))}
    class={`box-border flex gap-0.5 h-8 items-center justify-center px-1.5 py-0 relative rounded-lg shrink-0 cursor-pointer transition-all text-xs font-semibold ${
      selectedFilters.awaiting
        ? "bg-blue-600 text-white"
        : "bg-slate-800 text-gray-300 hover:bg-slate-700"
    }`}
  >
    בהמתנה
  </button>

  <button
    on:click={() => toggleFilter("collected")}
    on:keydown={(e) => handleKeyDown(e, () => toggleFilter("collected"))}
    class={`box-border flex gap-0.5 h-8 items-center justify-center px-1.5 py-0 relative rounded-lg shrink-0 cursor-pointer transition-all text-xs font-semibold ${
      selectedFilters.collected
        ? "bg-blue-600 text-white"
        : "bg-slate-800 text-gray-300 hover:bg-slate-700"
    }`}
  >
    אסוף
  </button>

  <button
    on:click={() => toggleFilter("completed")}
    on:keydown={(e) => handleKeyDown(e, () => toggleFilter("completed"))}
    class={`box-border flex gap-0.5 h-8 items-center justify-center px-1.5 py-0 relative rounded-lg shrink-0 cursor-pointer transition-all text-xs font-semibold ${
      selectedFilters.completed
        ? "bg-blue-600 text-white"
        : "bg-slate-800 text-gray-300 hover:bg-slate-700"
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
