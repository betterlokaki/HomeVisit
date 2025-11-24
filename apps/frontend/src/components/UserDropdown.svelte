<script lang="ts">
  import type { User } from "@homevisit/common";
  import { createEventDispatcher } from "svelte";

  export let users: User[] = [];
  export let selectedUsernames: string[] = [];
  export let isOpen: boolean = false;

  const dispatch = createEventDispatcher();

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function toggleUser(username: string | undefined) {
    if (!username) return;

    const index = selectedUsernames.indexOf(username);
    if (index > -1) {
      selectedUsernames.splice(index, 1);
    } else {
      selectedUsernames.push(username);
    }
    selectedUsernames = selectedUsernames; // Trigger reactivity
    dispatch("change", selectedUsernames);
  }

  function selectAll() {
    selectedUsernames = users
      .map((u) => u.username)
      .filter((u) => u !== undefined) as string[];
    dispatch("change", selectedUsernames);
  }

  function deselectAll() {
    selectedUsernames = [];
    dispatch("change", selectedUsernames);
  }

  function closeDropdown(e: MouseEvent) {
    // Only close if clicking outside the dropdown
    const target = e.target as HTMLElement;
    if (!target.closest(".user-dropdown-container")) {
      isOpen = false;
    }
  }
</script>

<svelte:window on:click={closeDropdown} />

<!-- User Dropdown -->
<div class="user-dropdown-container relative inline-block">
  <!-- Dropdown Button -->
  <button
    on:click|stopPropagation={toggleDropdown}
    class="px-3 py-1 rounded text-sm font-semibold transition-colors bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"
  >
    <span>יוזר ({selectedUsernames.length})</span>
    <svg
      class={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 14l-7 7m0 0l-7-7m7 7V3"
      />
    </svg>
  </button>

  <!-- Dropdown Menu -->
  {#if isOpen}
    <div
      class="absolute right-0 mt-1 w-56 bg-gray-800 border border-gray-700 rounded shadow-lg z-20"
      role="listbox"
      tabindex="-1"
      on:click|stopPropagation={() => {}}
      on:keydown|stopPropagation={() => {}}
    >
      <!-- Header with Select All / Deselect All -->
      <div class="border-b border-gray-700 p-2 flex gap-2">
        <button
          on:click|stopPropagation={selectAll}
          class="flex-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
        >
          בחר הכל
        </button>
        <button
          on:click|stopPropagation={deselectAll}
          class="flex-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-100 rounded transition-colors"
        >
          בטל הכל
        </button>
      </div>

      <!-- User List -->
      <div class="max-h-64 overflow-y-auto">
        {#each users as user (user.user_id)}
          <label
            class="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedUsernames.includes(user.username || "")}
              on:change|stopPropagation={() => toggleUser(user.username)}
              class="w-4 h-4 accent-blue-600"
            />
            <span class="text-sm text-gray-100 flex-1">
              {user.display_name || user.username}
            </span>
          </label>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Prevent dropdown from closing on internal clicks */
  :global(.user-dropdown-open) {
    z-index: 20;
  }
</style>
