<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { VisitCard } from "../stores/visitStore";
  import { visitStore } from "../stores/visitStore";
  import ActionButtons from "./ActionButtons.svelte";

  export let card: VisitCard;
  export let isSelected: boolean = false;

  const dispatch = createEventDispatcher();

  // Handler for card selection
  function onCardClick() {
    dispatch("select", card.site_id);
  }

  // Handlers for action buttons
  async function handleCompleted() {
    await visitStore.updateCardStatus(card.site_id, "Seen");
  }

  async function handlePartiallyCompleted() {
    await visitStore.updateCardStatus(card.site_id, "Partial");
  }

  async function handleNotDone() {
    await visitStore.updateCardStatus(card.site_id, "Not Seen");
  }

  function handleKeyDown(event: KeyboardEvent, handler: () => void) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
    }
  }

  // Get Hebrew status text and colors
  function getSeenStatusDisplay(status: string) {
    const statusMap: Record<
      string,
      { text: string; borderColor: string; textColor: string }
    > = {
      "Not Seen": {
        text: "מחכה לביקור",
        borderColor: "border-yellow-400",
        textColor: "text-yellow-400",
      },
      Partial: {
        text: "מחכה לביקור",
        borderColor: "border-yellow-400",
        textColor: "text-yellow-400",
      },
      Seen: {
        text: "בוצע",
        borderColor: "border-green-400",
        textColor: "text-green-400",
      },
      "Not Done": {
        text: "מחכה לביקור",
        borderColor: "border-red-400",
        textColor: "text-red-400",
      },
    };
    return statusMap[status] || statusMap["Not Seen"];
  }

  // Get updated status display based on updatedStatus field
  function getUpdatedStatusDisplay(status: string) {
    if (status === "No") {
      return {
        text: "אין איסוף",
        borderColor: "border-red-500",
        textColor: "text-red-500",
      };
    }
    return getSeenStatusDisplay(status);
  }

  // Format date function
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
</script>

<!-- Simple card with just the lightning bolt button at top-left -->
<div
  class="bg-gray-800 border {isSelected
    ? 'border-blue-400 shadow-lg shadow-blue-400/50 scale-[1.03]'
    : 'border-gray-700'} pl-12 pr-0 rounded-lg w-full min-h-[100px] relative transition-all duration-300 ease-out hover:scale-102 hover:shadow-xl hover:shadow-blue-400/30 hover:border-blue-300 cursor-default"
  dir="rtl"
  on:click={onCardClick}
  on:keydown={(e) => handleKeyDown(e, onCardClick)}
  role="button"
  tabindex="0"
>
  <!-- Lightning Bolt Button - Top Left -->
  <a
    href={card.updatedStatus === "No" ? "#" : card.siteLink}
    target={card.updatedStatus === "No" ? "_self" : "_blank"}
    rel="noopener noreferrer"
    on:click|stopPropagation={(e) => {
      if (card.updatedStatus === "No") {
        e.preventDefault();
      }
    }}
    on:keydown={(e) => handleKeyDown(e, () => {})}
    class="absolute top-2 left-2 border {card.updatedStatus === 'No'
      ? 'border-gray-500 bg-gray-800 cursor-not-allowed opacity-50'
      : 'border-gray-600 bg-gray-700 hover:bg-gray-600 cursor-pointer'} flex items-center justify-center h-5 w-5 rounded transition-colors group"
    title={card.updatedStatus === "No" ? "לא זמין" : "פתח מפקח"}
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
  </a>

  <!-- Action Buttons - Show when selected and updatedStatus is not 'No' -->
  {#if isSelected && card.updatedStatus !== "No"}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="absolute top-2 left-9 flex items-center"
      on:click|stopPropagation
    >
      <ActionButtons
        disabledButton={card.updatedStatus === "Partial" ? "completed" : null}
        on:completed={handleCompleted}
        on:partiallyCompleted={handlePartiallyCompleted}
        on:notDone={handleNotDone}
      />
    </div>
  {/if}

  <!-- Status Badge and Site Name - Right Side -->
  <div class="absolute top-2 right-2 flex items-center justify-end gap-1.5">
    <div class="flex flex-col gap-1.5 items-end w-20">
      <!-- Status Badge -->
      <div
        class="{getUpdatedStatusDisplay(card.updatedStatus)
          .borderColor} border flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-sm w-full"
      >
        <p
          class="font-normal text-xs leading-3 {getUpdatedStatusDisplay(
            card.updatedStatus
          ).textColor} text-right"
          style="font-size: 10px;"
        >
          {getUpdatedStatusDisplay(card.updatedStatus).text}
        </p>
        <!-- Small status icon circle -->
        <div
          class="w-2 h-2 rounded-full {getUpdatedStatusDisplay(
            card.updatedStatus
          ).textColor.replace('text-', 'bg-')}"
        ></div>
      </div>
    </div>

    <!-- Site Name -->
    <p class="font-bold text-sm text-white text-right">
      {card.site_name}
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
        <p>{card.user_id}</p>
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
        <p>{formatDate(card.seen_date)}</p>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    direction: rtl;
  }
</style>
