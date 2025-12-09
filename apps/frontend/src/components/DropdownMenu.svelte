<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { DropdownMenuItem } from "./types/dropdownMenu";

  export let items: DropdownMenuItem[] = [];
  export let isOpen: boolean = false;
  export let position: "left" | "right" = "left";

  const dispatch = createEventDispatcher();

  function handleItemClick(item: DropdownMenuItem) {
    item.action();
    dispatch("itemClick", item);
  }

  function handleKeyDown(event: KeyboardEvent, item: DropdownMenuItem) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleItemClick(item);
    }
  }
</script>

{#if isOpen}
  <div
    class="absolute top-full {position === 'left'
      ? 'left-0'
      : 'right-0'} mt-1 flex flex-col items-end gap-1 p-1 w-[200px] bg-[#1F1F1F] rounded-md shadow-[0px_0px_6px_rgba(0,0,0,0.12)] z-50"
    dir="rtl"
    role="menu"
    aria-orientation="vertical"
  >
    {#each items as item (item.title)}
      <button
        on:click={() => handleItemClick(item)}
        on:keydown={(e) => handleKeyDown(e, item)}
        class="flex flex-row justify-end items-center gap-2 px-6 py-0 w-[192px] h-10 rounded-lg hover:bg-gray-800 transition-colors"
        role="menuitem"
        tabindex="0"
      >
        <!-- Icon -->
        <div class="flex-none w-4 h-4 flex items-center justify-center">
          {@html item.icon}
        </div>
        <!-- Title -->
        <p
          class="flex-1 text-right text-sm font-normal leading-[22px] text-white"
          style="font-family: 'Heebo', sans-serif;"
        >
          {item.title}
        </p>
      </button>
    {/each}
  </div>
{/if}
