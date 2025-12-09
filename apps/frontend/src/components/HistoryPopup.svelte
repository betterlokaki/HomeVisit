<script lang="ts">
  import type { MergedHistoryEntry } from "@homevisit/common";
  import { API_CONFIG } from "../config/env";
  import { formatDate } from "../utils/statusDisplay";
  import dayjs from "dayjs";
  import "dayjs/locale/he";
  import HistoryCalendar from "./HistoryCalendar.svelte";

  dayjs.locale("he");

  export let siteId: number;
  export let groupId: number;
  export let siteName: string;
  export let isOpen: boolean = false;

  let history: MergedHistoryEntry[] = [];
  let loading = false;
  let error: string | null = null;
  let selectedDate: dayjs.Dayjs | null = null;
  let selectedEntry: MergedHistoryEntry | null = null;

  async function fetchHistory() {
    if (!siteId || !groupId) return;

    loading = true;
    error = null;

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/cover-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, groupId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      history = (data.history || []).map((h: any) => ({
        ...h,
        date: h.date,
      }));
    } catch (err) {
      error = err instanceof Error ? err.message : "שגיאה בטעינת ההיסטוריה";
      console.error("Failed to fetch history:", err);
    } finally {
      loading = false;
    }
  }

  function handleClose() {
    isOpen = false;
    selectedDate = null;
    selectedEntry = null;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      handleClose();
    }
  }

  function handleDateSelect(event: CustomEvent) {
    selectedDate = event.detail.date;
    selectedEntry = event.detail.entry;
  }

  $: if (isOpen && siteId && groupId) {
    fetchHistory();
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
    on:click={handleClose}
    on:keydown={handleKeyDown}
    role="button"
    aria-label="סגור חלון"
    tabindex="0"
  >
    <!-- Modal Content -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="bg-[#1F1F1F] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-700"
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
      dir="rtl"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-700"
      >
        <h2
          id="history-title"
          class="text-lg font-bold text-white"
          style="font-family: 'Heebo', sans-serif;"
        >
          היסטוריית ביקורים - {siteName}
        </h2>
        <button
          on:click={handleClose}
          on:keydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClose();
            }
          }}
          class="text-gray-400 hover:text-white transition-colors p-1 rounded"
          aria-label="סגור"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Content Wrapper -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="content-wrapper">
        <!-- Info Panel -->
        <div class="info-panel">
          {#if selectedEntry}
            <div class="info-section">
              <div class="info-row">
                <p class="info-date">{formatDate(selectedEntry.date)}</p>
                <p class="info-label">תאריך ושעה</p>
              </div>
              <div class="info-row">
                <p class="info-value">
                  {selectedEntry.coverStatus === "No"
                    ? "אין כיסוי"
                    : selectedEntry.coverStatus === "Full"
                      ? "כיסוי מלא"
                      : "כיסוי חלקי"}
                </p>
                <p class="info-label">סוג ביצוע</p>
              </div>
              <div class="info-row">
                <p class="info-value">
                  {selectedEntry.visitStatus === "Seen"
                    ? "טופל"
                    : selectedEntry.visitStatus === "Partial"
                      ? "טופל חלקית"
                      : "לא טופל"}
                </p>
                <p class="info-label">מבצע</p>
              </div>
            </div>
          {:else if selectedDate}
            <div class="info-section">
              <p class="info-label">בחר תאריך להצגת פרטים</p>
            </div>
          {:else}
            <div class="info-section">
              <p class="info-label">בחר תאריך להצגת פרטים</p>
            </div>
          {/if}
        </div>

        <!-- Divider -->
        <div class="divider"></div>

        <!-- Calendar -->
        <div class="calendar-container">
          {#if loading}
            <div class="flex items-center justify-center py-8">
              <p class="text-gray-400">טוען...</p>
            </div>
          {:else if error}
            <div class="flex items-center justify-center py-8">
              <p class="text-red-400">{error}</p>
            </div>
          {:else}
            <HistoryCalendar
              {history}
              bind:selectedDate
              on:dateSelect={handleDateSelect}
            />
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(body:has(.fixed.inset-0.bg-black)) {
    overflow: hidden;
  }

  .content-wrapper {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 0 24px 12px;
    gap: 10px;
    width: 644px;
    height: 386px;
    flex: none;
    order: 1;
    align-self: stretch;
    flex-grow: 0;
    box-sizing: border-box;
  }

  .info-panel {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-start;
    padding: 12px;
    gap: 16px;
    width: 222px;
    height: 374px;
    background: #141414;
    border: 1px solid #262626;
    border-radius: 8px;
    flex: none;
    order: 0;
    flex-grow: 0;
    box-sizing: border-box;
  }

  .info-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 8px 0;
    gap: 16px;
    width: 222px;
    height: 350px;
    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
  }

  .info-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0;
    gap: 16px;
    width: 100%;
    height: 22px;
    flex: none;
    order: 0;
    flex-grow: 0;
  }

  .info-label {
    font-family: "Heebo", sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 22px;
    text-align: right;
    color: #ffffff;
    flex: none;
    order: 1;
  }

  .info-value {
    font-family: "Heebo", sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    text-align: right;
    color: #ffffff;
    flex: none;
    order: 0;
  }

  .info-date {
    font-family: "Heebo", sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    text-align: right;
    color: #ffffff;
    flex: none;
    order: 0;
  }

  .divider {
    width: 1px;
    height: 350px;
    background: #262626;
    flex: none;
    order: 1;
    align-self: stretch;
    flex-grow: 0;
  }

  .calendar-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 8px 0;
    gap: 12px;
    width: 50%;
    height: calc(100% - 12px);
    flex: none;
    order: 2;
    flex-grow: 0;
  }
</style>
