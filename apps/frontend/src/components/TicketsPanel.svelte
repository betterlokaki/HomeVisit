<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import VisitCard from "./VisitCard.svelte";
  import UserDropdown from "./UserDropdown.svelte";
  import type { VisitCard as VisitCardType } from "../stores/visitStore";
  import type { SiteFilters } from "../stores/visitStore";
  import { visitStore } from "../stores/visitStore";
  import {
    fetchCoverUpdate,
    fetchAllSitesHistory,
    fetchSites,
  } from "../stores/visit/visitApiClient";
  import { historyStore } from "../stores/history";
  import type { User } from "@homevisit/common";
  import dayjs from "dayjs";
  import { filterCardsForHistory } from "./historyFilter";
  import {
    buildXlsxWorkbook,
    downloadXlsx,
    generateXlsxFilename,
  } from "../utils/xlsxExporter";

  // Filter cards based on history if viewing past date
  $: filteredCards = filterCardsForHistory(
    cards,
    filters,
    $historyStore.selectedDate
  );

  // Calculate progress: sites with seen_status = "Seen" are considered done (use filtered cards)
  $: completedCount = filteredCards.filter(
    (card) => card.seen_status === "Seen"
  ).length;
  $: totalCount = filteredCards.length;
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
  let unsubscribeHistoryStore: any;

  // Subscribe to history store for selected date - make it reactive
  let currentDisplayDate: string = dayjs().format("YYYY-MM-DD");

  // React to history store changes
  $: {
    const storeState = $historyStore;
    if (storeState.selectedDate === null) {
      currentDisplayDate = dayjs().format("YYYY-MM-DD");
    } else {
      currentDisplayDate = storeState.selectedDate;
    }
  }

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

    // Subscribe to history store
    unsubscribeHistoryStore = historyStore.subscribe(() => {
      // React to history store changes
    });

    // Initial load
    currentGroup = visitStore.getGroupName();
    loadGroupUsersForCurrentGroup();

    return () => {
      if (unsubscribeStore) unsubscribeStore();
      if (unsubscribeHistoryStore) unsubscribeHistoryStore();
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

    // Reload cards with new filters
    await visitStore.updateFilters(filters);

    // Load history for all sites after cards are loaded
    await loadHistoryForAllSites();
  }

  // Load history for all sites
  async function loadHistoryForAllSites() {
    if (cards.length === 0) return;

    try {
      historyStore.setLoading(true);
      const historyMap = await fetchAllSitesHistory(cards);

      // Store history in history store
      historyMap.forEach((history, siteId) => {
        historyStore.setSiteHistory(siteId, history.history);
      });

      historyStore.setLoading(false);
      console.log("Loaded history for", historyMap.size, "sites");
    } catch (error) {
      console.error("Failed to load history for all sites:", error);
      historyStore.setError(
        error instanceof Error ? error.message : "Failed to load history"
      );
      historyStore.setLoading(false);
    }
  }

  // Track if history has been loaded for current cards
  let lastCardsHash: string = "";

  // React to cards changes to load history (only if cards actually changed)
  $: {
    const currentHash = cards
      .map((c) => c.site_id)
      .sort()
      .join(",");
    if (currentHash !== lastCardsHash && cards.length > 0) {
      lastCardsHash = currentHash;
      loadHistoryForAllSites();
    }
  }

  // Handler for card selection
  function handleCardSelect(cardId: number) {
    // Toggle selection: if same card is clicked, deselect it; otherwise select the new card
    selectedCardId = selectedCardId === cardId ? null : cardId;
    if (selectedCardId !== null) {
      dispatch("cardSelect", selectedCardId);
      // Fetch cover update history for the selected card
      const selectedCard = filteredCards.find((c) => c.site_id === cardId);
      if (selectedCard) {
        fetchCoverUpdateHistory(selectedCard);
      }
    }
    console.log("Card selected:", cardId);
  }

  // Fetch cover update history for a card and log to console
  async function fetchCoverUpdateHistory(card: VisitCardType) {
    console.log(
      "Fetching cover update history for site:",
      card.site_id,
      card.site_name
    );
    const result = await fetchCoverUpdate(card.site_id, card.group_id);
    if (result) {
      console.log("Cover update history:", result);
    } else {
      console.error(
        "Failed to fetch cover update history for site:",
        card.site_id
      );
    }
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
      // Reload cards with new filters
      await visitStore.updateFilters(filters);
    }
  }

  // Handle user selection change
  async function handleUsersChange(event: CustomEvent<string[]>) {
    filters.selectedUsers = event.detail;
    // Reload cards with new filters
    await visitStore.updateFilters(filters);
  }

  // Handle XLSX download
  async function handleDownloadCsv() {
    try {
      // Show loading state (optional - you could add a loading indicator)
      console.log("Starting XLSX download...");

      // Fetch all sites from backend (no filters)
      const allSites = await fetchSites(currentGroup, {});
      console.log("Fetched sites:", allSites.length);

      // Fetch history for all sites
      const historyMap = await fetchAllSitesHistory(allSites);
      console.log("Fetched history for sites:", historyMap.size);

      // Build XLSX workbook with RTL, colors, and proper date formatting
      const workbook = await buildXlsxWorkbook(allSites, historyMap);
      console.log("XLSX workbook created");

      // Generate filename with date range
      const filename = generateXlsxFilename();

      // Download the file
      await downloadXlsx(workbook, filename);

      console.log("XLSX download completed");
    } catch (error) {
      console.error("Failed to download XLSX:", error);
      alert("שגיאה בהורדת הקובץ. אנא נסה שוב.");
    }
  }
</script>

<!-- Tickets Panel - Right Side with Dark Theme -->
<div
  class="tickets-panel box-border flex flex-col h-full relative rounded-lg shrink-0 w-full flex-1"
  style="min-height: 600px; background-color: #1A1A1A;"
  dir="rtl"
>
  <!-- Fixed Header Section (not scrollable) -->
  <div
    class="flex flex-col gap-0.75 items-end justify-center shrink-0 w-full p-2 pb-3"
    style="background-color: #1A1A1A; border-bottom: 1px solid #333;"
  >
    <div class="flex gap-1.5 items-center relative shrink-0 w-full">
      <h2 class="text-xl font-bold text-white">ביקורים</h2>
      <span class="text-sm text-gray-400">
        {filteredCards.length} בתים
      </span>

      <!-- Download CSV Button - Left side (end in RTL, visually left) -->
      <div class="relative group mr-auto">
        <button
          on:click={handleDownloadCsv}
          class="flex items-center justify-center w-8 h-8 rounded bg-gray-700 hover:bg-gray-600 text-gray-100 transition-colors"
          type="button"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        <!-- Tooltip -->
        <div
          class="absolute right-full mr-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
        >
          הורד מידע סיכומי
        </div>
      </div>
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
        <span class="text-xs font-bold text-blue-400">{progressPercent}%</span>
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

    <!-- History Navigation Controls -->
    <div
      class="flex gap-2 items-center justify-center w-full mt-2 pt-2 border-t border-gray-700"
    >
      <!-- Previous Day Button -->
      <button
        on:click={() => historyStore.goToPreviousDay()}
        class="flex items-center justify-center w-8 h-8 rounded bg-gray-700 hover:bg-gray-600 text-gray-100 transition-colors"
        title="יום קודם"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <!-- Current Date Display -->
      <div
        class="flex items-center gap-2 px-3 py-1 rounded bg-gray-800 text-sm text-gray-100"
      >
        <span>
          {$historyStore.selectedDate === null
            ? "היום"
            : dayjs(currentDisplayDate).format("DD/MM/YYYY")}
        </span>
      </div>

      <!-- Next Day Button (disabled if on today) -->
      <button
        on:click={() => historyStore.goToNextDay()}
        disabled={!historyStore.canGoForward() ||
          currentDisplayDate >= dayjs().format("YYYY-MM-DD")}
        class="flex items-center justify-center w-8 h-8 rounded bg-gray-700 hover:bg-gray-600 text-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="יום הבא"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <!-- Go to Today Button -->
      <button
        on:click={() => historyStore.goToToday()}
        class="px-3 py-1 rounded text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        title="חזור להיום"
      >
        היום
      </button>
    </div>
  </div>

  <!-- Scrollable Content Area -->
  <div class="scrollable-content flex-1 overflow-y-auto p-2 pt-0">
    <!-- Loading State -->
    {#if loading}
      <div
        class="flex flex-col gap-1 items-center justify-center w-full px-2 py-2.5 mt-2"
      >
        <div class="animate-spin">
          <div
            class="w-10 h-10 border-4 border-gray-800 border-t-blue-600 rounded-full"
          />
        </div>
        <p class="text-sm text-gray-400">טוען נתונים...</p>
      </div>
    {/if}

    <!-- History Loading State -->
    {#if $historyStore.loading && !loading}
      <div
        class="flex flex-col gap-1 items-center justify-center w-full px-2 py-2.5 mt-2"
      >
        <div class="animate-spin">
          <div
            class="w-10 h-10 border-4 border-gray-800 border-t-blue-600 rounded-full"
          />
        </div>
        <p class="text-sm text-gray-400">טוען היסטוריה...</p>
      </div>
    {/if}

    <!-- Visit Cards List -->
    {#if !loading && !$historyStore.loading && filteredCards.length > 0}
      <div class="flex flex-col gap-2 w-full pt-2 pb-5 px-3">
        {#each filteredCards as card (card.site_id)}
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
    {#if !loading && filteredCards.length === 0}
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
