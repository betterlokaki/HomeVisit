<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import VisitCard from "./VisitCard.svelte";
  import UserDropdown from "./UserDropdown.svelte";
  import type { VisitCard as VisitCardType } from "../stores/visitStore";
  import type { SiteFilters } from "../stores/visitStore";
  import { visitStore } from "../stores/visitStore";
  import { saveFilters } from "../utils/filterStorage";
  import type { User } from "@homevisit/common";

  // Calculate progress: sites with seen_status = "Seen" are considered done
  $: completedCount = cards.filter(
    (card) => card.seen_status === "Seen"
  ).length;
  $: totalCount = cards.length;
  $: progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  export let cards: VisitCardType[] = [];
  export let loading: boolean = false;
  export let groupName: string = "Weekly Refresh Group";

  const dispatch = createEventDispatcher();

  // Track which card is currently selected
  let selectedCardId: number | null = null;

  // User dropdown state
  let groupUsers: User[] = [];
  let userDropdownOpen: boolean = false;
  let currentGroup: string = "Weekly Refresh Group";

  // Filter state
  let filters: SiteFilters = {
    selectedUsers: [],
    awaiting: false,
    collection: false,
    completedFull: false,
    completedPartial: false,
  };

  // Load filters and users on mount
  let unsubscribeStore: any;

  onMount(() => {
    // Subscribe to store changes to detect group changes
    unsubscribeStore = visitStore.subscribe(() => {
      const newGroup = visitStore.getGroupName();
      if (newGroup !== currentGroup) {
        console.log("Store: Group changed from", currentGroup, "to", newGroup);
        currentGroup = newGroup;
        loadGroupUsersForCurrentGroup();
      }
    });

    // Initial load
    currentGroup = visitStore.getGroupName();
    loadGroupUsersForCurrentGroup();

    return () => {
      if (unsubscribeStore) unsubscribeStore();
    };
  });

  // React to groupName prop changes
  $: if (groupName && groupName !== currentGroup) {
    console.log("Prop: Group changed from", currentGroup, "to", groupName);
    currentGroup = groupName;
    loadGroupUsersForCurrentGroup();
  }

  // Load group users and reset filters
  async function loadGroupUsersForCurrentGroup() {
    console.log("Loading users for group:", currentGroup);
    groupUsers = await visitStore.loadGroupUsers();
    console.log("Loaded groupUsers:", groupUsers);

    // Reset selected users and select all from new group
    filters.selectedUsers = groupUsers
      .map((u) => u.username)
      .filter((u) => u !== undefined) as string[];
    console.log("Auto-selected users:", filters.selectedUsers);
    saveFilters(filters);

    // Reload cards with new filters
    await visitStore.updateFilters(filters);
  }

  // Handler for card selection
  function handleCardSelect(cardId: number) {
    // Toggle selection: if same card is clicked, deselect it; otherwise select the new card
    selectedCardId = selectedCardId === cardId ? null : cardId;
    if (selectedCardId !== null) {
      dispatch("cardSelect", selectedCardId);
    }
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

  // Handle filter toggle
  async function toggleFilter(filterName: keyof SiteFilters) {
    if (filterName !== "selectedUsers") {
      filters[filterName] = !filters[filterName];
      // Save to localStorage
      saveFilters(filters);
      // Reload cards with new filters
      await visitStore.updateFilters(filters);
    }
  }

  // Handle user selection change
  async function handleUsersChange(event: CustomEvent<string[]>) {
    filters.selectedUsers = event.detail;
    // Save to localStorage
    saveFilters(filters);
    // Reload cards with new filters
    await visitStore.updateFilters(filters);
  }
</script>

<!-- Tickets Panel - Right Side with Dark Theme -->
<div
  class="tickets-panel box-border flex flex-col h-full relative rounded-lg shrink-0 w-full flex-1"
  style="min-height: 600px; background-color: #1A1A1A;"
  dir="rtl"
>
  <!-- Scrollable Content Area -->
  <div class="scrollable-content flex-1 overflow-y-auto p-1 pt-2">
    <!-- Title Section -->
    <div
      class="flex flex-col gap-0.75 items-end justify-center shrink-0 w-full sticky top-0 z-10 pb-0.75"
      style="background-color: #1A1A1A;"
    >
      <div class="flex gap-1.5 items-center relative shrink-0 w-full">
        <h2 class="text-xl font-bold text-white">ביקורי אתרים</h2>
        <span class="text-sm text-gray-400">
          {cards.length} אתרים
        </span>
      </div>

      <!-- Filter Section -->
      <div class="flex gap-1 items-center w-full flex-wrap">
        <!-- User Dropdown Filter -->
        <UserDropdown
          users={groupUsers}
          selectedUsernames={filters.selectedUsers}
          isOpen={userDropdownOpen}
          on:change={handleUsersChange}
        />

        <!-- Button 2: Awaiting Filter (updatedStatus Full|Partial AND seen_status Not Seen|Partial) -->
        <button
          on:click={() => toggleFilter("awaiting")}
          class={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            filters.awaiting
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-100"
          }`}
        >
          מחכה לביקור
        </button>

        <!-- Button 3: Collection Filter (updatedStatus = "No") -->
        <button
          on:click={() => toggleFilter("collection")}
          class={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            filters.collection
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-100"
          }`}
        >
          דרוש לאיסוף
        </button>

        <!-- Button 4: Completed Full Filter (seen_status = "Seen") -->
        <button
          on:click={() => toggleFilter("completedFull")}
          class={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            filters.completedFull
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-100"
          }`}
        >
          בוצע
        </button>

        <!-- Button 5: Completed Partial Filter (seen_status = "Partial") -->
        <button
          on:click={() => toggleFilter("completedPartial")}
          class={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            filters.completedPartial
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-100"
          }`}
        >
          בוצע חלקית
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="w-full mt-2">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs text-gray-400">התקדמות ביקורים</span>
          <span class="text-xs font-bold text-blue-400">{progressPercent}%</span
          >
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

    <!-- Loading State -->
    {#if loading}
      <div
        class="flex flex-col gap-1 items-center justify-center w-full px-2 py-2.5"
      >
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
      <div class="flex flex-col gap-1 w-full py-5">
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
</div>

<style>
  /* Custom scrollbar styling - right side for RTL */
  .scrollable-content {
    direction: ltr;
  }

  .scrollable-content > * {
    direction: rtl;
  }

  /* Scrollbar styling */
  .scrollable-content::-webkit-scrollbar {
    width: 8px;
  }

  .scrollable-content::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 4px;
  }

  .scrollable-content::-webkit-scrollbar-thumb {
    background: #434343;
    border-radius: 4px;
    border: 2px solid #1a1a1a;
  }

  .scrollable-content::-webkit-scrollbar-thumb:hover {
    background: #555555;
  }

  /* Firefox scrollbar */
  .scrollable-content {
    scrollbar-width: thin;
    scrollbar-color: #434343 #1a1a1a;
  }
</style>
