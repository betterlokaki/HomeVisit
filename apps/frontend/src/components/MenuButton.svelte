<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import DropdownMenu from "./DropdownMenu.svelte";
  import type { DropdownMenuItem } from "./types/dropdownMenu";

  export let items: DropdownMenuItem[] = [];
  export let position: "left" | "right" = "left";

  let isOpen = false;
  let menuButtonEl: HTMLElement;
  let containerEl: HTMLElement;

  const dispatch = createEventDispatcher();

  function toggleMenu() {
    isOpen = !isOpen;
    if (isOpen) {
      dispatch("open");
    } else {
      dispatch("close");
    }
  }

  function handleOutsideClick(event: MouseEvent) {
    if (isOpen && containerEl && !containerEl.contains(event.target as Node)) {
      isOpen = false;
      dispatch("close");
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleMenu();
    } else if (event.key === "Escape" && isOpen) {
      isOpen = false;
      dispatch("close");
    }
  }

  onMount(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  });
</script>

<div class="relative" bind:this={containerEl} dir="rtl">
  <!-- Menu Button - Three Dots Icon -->
  <button
    bind:this={menuButtonEl}
    on:click|stopPropagation={toggleMenu}
    on:keydown={handleKeyDown}
    class="flex items-center justify-center w-6 h-6 border border-gray-600 bg-gray-700 hover:bg-gray-600 rounded transition-colors cursor-pointer group"
    title="תפריט נוסף"
    aria-label="תפריט נוסף"
    aria-expanded={isOpen}
    aria-haspopup="true"
  >
    <svg
      width="1rem"
      height="1rem"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="text-gray-100 group-hover:text-white"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  </button>

  <!-- Dropdown Menu -->
  <DropdownMenu {items} {isOpen} {position} />
</div>
