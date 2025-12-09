<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { VisitCard } from "../stores/visitStore";
  import { visitStore } from "../stores/visitStore";
  import ActionButtons from "./ActionButtons.svelte";
  import MenuButton from "./MenuButton.svelte";
  import HistoryPopup from "./HistoryPopup.svelte";
  import type { DropdownMenuItem } from "./types/dropdownMenu";
  import { getUpdatedStatusDisplay, formatDate } from "../utils/statusDisplay";

  export let card: VisitCard;
  export let isSelected: boolean = false;

  const dispatch = createEventDispatcher();
  const cardData = card as any;
  let isHistoryPopupOpen = false;

  function onCardClick() {
    dispatch("select", card.site_id);
  }

  async function handleCompleted() {
    await visitStore.updateCardStatus(card.site_id, "Seen");
    dispatch("select", card.site_id);
  }

  async function handlePartiallyCompleted() {
    await visitStore.updateCardStatus(card.site_id, "Partial");
    dispatch("select", card.site_id);
  }

  async function handleNotDone() {
    await visitStore.updateCardStatus(card.site_id, "Not Seen");
    dispatch("select", card.site_id);
  }

  function handleKeyDown(event: KeyboardEvent, handler: () => void) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
    }
  }

  // History icon SVG (16x16 with border as per Figma)
  const historyIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2.667C5.427 2.667 3.333 4.76 3.333 7.333C3.333 9.907 5.427 12 8 12C10.573 12 12.667 9.907 12.667 7.333C12.667 4.76 10.573 2.667 8 2.667ZM8 10.667C6.16 10.667 4.667 9.173 4.667 7.333C4.667 5.493 6.16 4 8 4C9.84 4 11.333 5.493 11.333 7.333C11.333 9.173 9.84 10.667 8 10.667Z" stroke="rgba(255, 255, 255, 0.65)" stroke-width="1" fill="none"/>
    <path d="M8 5.333V7.333L9.333 8.667" stroke="rgba(255, 255, 255, 0.65)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;

  function openHistoryPopup() {
    isHistoryPopupOpen = true;
  }

  const menuItems: DropdownMenuItem[] = [
    {
      title: "היסטוריה",
      icon: historyIcon,
      action: openHistoryPopup,
    },
  ];
</script>

<!-- Simple card with just the lightning bolt button at top-left -->
<div
  class="visit-card border {isSelected
    ? 'border-blue-400 shadow-lg shadow-blue-400/50 scale-[1.03]'
    : ''} pl-12 pr-0 rounded-lg w-full min-h-[100px] relative transition-all duration-300 ease-out hover:scale-102 hover:shadow-xl hover:shadow-blue-400/30 hover:border-blue-300 cursor-default"
  style="background-color: #1A1A1A; border-color: {isSelected
    ? ''
    : '#434343'};"
  dir="rtl"
  on:click={onCardClick}
  on:keydown={(e) => handleKeyDown(e, onCardClick)}
  role="button"
  tabindex="0"
>
  <!-- Left Side Buttons Container - All buttons in one row -->
  <div
    class="absolute top-2 left-1.5 flex items-center gap-1.5 flex-row-reverse"
  >
    <!-- Card Menu Button - Leftmost Position (first visually in RTL) -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation>
      <MenuButton items={menuItems} position="left" />
    </div>

    <!-- Lightning Bolt Button -->
    <a
      href={card.updatedStatus === "No" ? "#" : card.siteLink}
      target="_self"
      rel="noopener noreferrer"
      on:click|stopPropagation={(e) => {
        if (card.updatedStatus === "No") {
          e.preventDefault();
        }
      }}
      on:keydown={(e) => handleKeyDown(e, () => {})}
      class="border {card.updatedStatus === 'No'
        ? 'border-gray-500 bg-gray-800 cursor-not-allowed opacity-50'
        : 'border-gray-600 bg-gray-700 hover:bg-gray-600 cursor-pointer'} flex items-center justify-center gap-1 h-6 px-1.5 rounded transition-colors group"
      title={card.updatedStatus === "No" ? "אין איסוף" : "פתח בברק"}
      style={card.updatedStatus === "No" ? "pointer-events: none;" : ""}
    >
      <div
        class={card.updatedStatus === "No"
          ? "text-gray-500"
          : "text-gray-100 group-hover:text-white"}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
        </svg>
      </div>
      {#if card.updatedStatus !== "No"}
        <span class="text-xs text-gray-100 group-hover:text-white">פתח</span>
      {/if}
    </a>

    <!-- Separator -->
    {#if isSelected && card.updatedStatus !== "No"}
      <div class="h-4 w-px bg-gray-600"></div>
    {/if}

    <!-- Action Buttons - Show when selected and updatedStatus is not 'No' -->
    {#if isSelected && card.updatedStatus !== "No"}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div on:click|stopPropagation>
        <ActionButtons
          currentStatus={card.seen_status}
          updatedStatus={card.updatedStatus}
          disabledButton={card.seen_status === "Partial" ? "completed" : null}
          on:completed={handleCompleted}
          on:partiallyCompleted={handlePartiallyCompleted}
          on:notDone={handleNotDone}
        />
      </div>
    {/if}
  </div>

  <!-- Status Badge and Site Name - Right Side -->
  <div class="absolute top-2 right-2 flex items-center justify-end gap-1.5">
    <div class="flex flex-col gap-1.5 items-end w-20">
      <!-- Status Badge -->
      <div
        class="{getUpdatedStatusDisplay(card.updatedStatus, card.seen_status)
          .borderColor} border flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-sm w-full"
      >
        <p
          class="font-normal text-xs leading-3 {getUpdatedStatusDisplay(
            card.updatedStatus,
            card.seen_status
          ).textColor} text-center"
          style="font-size: 12px;"
        >
          {getUpdatedStatusDisplay(card.updatedStatus, card.seen_status).text}
        </p>
        <!-- Small status icon circle -->
        <div
          class="w-2 h-2 rounded-full {getUpdatedStatusDisplay(
            card.updatedStatus,
            card.seen_status
          ).textColor.replace('text-', 'bg-')}"
        ></div>
      </div>
    </div>

    <!-- Site Name -->
    <p class="font-bold text-sm text-white text-right">
      {cardData.site_name}
    </p>
  </div>

  <!-- Additional Info Section - Right Side Under Title -->
  <div class="absolute top-12 right-2 flex flex-col gap-2 items-end">
    <!-- Inspector Info Row -->

    <div class="flex items-start w-full gap-3">
      <div
        class="flex flex-col font-bold text-xs leading-5 justify-center text-gray-300 text-right flex-1"
      >
        <p>אחראי</p>
      </div>
      <div
        class="flex flex-col font-normal text-xs leading-5 justify-center whitespace-nowrap text-gray-300 text-right w-32"
      >
        <p>{cardData.display_name || cardData.username}</p>
      </div>
    </div>

    <!-- Last Visit Date Row -->
    <div class="flex items-start w-full gap-3">
      <div
        class="flex flex-col font-bold text-xs leading-5 justify-center text-gray-300 text-right flex-1"
      >
        <p>תאריך ביקור אחרון</p>
      </div>
      <div
        class="flex flex-col font-normal text-xs leading-5 justify-center whitespace-nowrap text-gray-300 text-right w-32"
      >
        <p>{formatDate(cardData.seen_date)}</p>
      </div>
    </div>
  </div>

  <!-- History Popup -->
  <HistoryPopup
    siteId={card.site_id}
    groupId={card.group_id}
    siteName={cardData.site_name}
    bind:isOpen={isHistoryPopupOpen}
  />
</div>

<style>
  :global(body) {
    direction: rtl;
  }
</style>
