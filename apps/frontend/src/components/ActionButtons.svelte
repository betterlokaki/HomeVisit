<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let disabledButton: string | null = null;
  export let currentStatus: string = "Not Seen";
  export let updatedStatus: string = "Full";

  const dispatch = createEventDispatcher();

  // Async function for "בוצע" (Completed) button
  async function handleCompleted() {
    console.log("בוצע button clicked");
    dispatch("completed");
  }

  // Async function for "בוצע חלקית" (Partially Completed) button
  async function handlePartiallyCompleted() {
    console.log("בוצע חלקית button clicked");
    dispatch("partiallyCompleted");
  }

  // Async function for "לא בוצע" (Not done) button
  async function handleNotDone() {
    console.log("לא בוצע button clicked");
    dispatch("notDone");
  }

  function handleKeyDown(event: KeyboardEvent, handler: () => void) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
    }
  }

  // Get button style based on status
  function getButtonClass(status: string, isDisabled: boolean) {
    const isActive = currentStatus === status;

    if (isDisabled) {
      return "border border-blue-500 bg-gray-600 cursor-not-allowed opacity-50 text-white";
    }

    if (isActive) {
      return "border border-blue-500 bg-blue-500 hover:bg-blue-600 text-white";
    }

    return "border border-blue-500 bg-transparent hover:bg-blue-500/10 text-blue-500 hover:text-white";
  }
</script>

<div class="flex gap-2 items-center">
  <!-- בוצע (Completed) Button -->
  <button
    on:click={handleCompleted}
    on:keydown={(e) => handleKeyDown(e, handleCompleted)}
    disabled={disabledButton === "completed" || updatedStatus !== "Full"}
    class="flex items-center justify-center px-4 py-1 rounded-lg transition-colors {getButtonClass(
      'Seen',
      disabledButton === 'completed' || updatedStatus !== 'Full'
    )}"
    title={updatedStatus !== "Full"
      ? "לא ניתן לבצע, אין איסוף מלא"
      : disabledButton === "completed"
        ? "לא זמין בסטטוס זה"
        : "בוצע"}
  >
    <p class="font-normal text-sm text-right leading-5">בוצע</p>
  </button>

  <!-- בוצע חלקית (Partially Completed) Button -->
  <button
    on:click={handlePartiallyCompleted}
    on:keydown={(e) => handleKeyDown(e, handlePartiallyCompleted)}
    disabled={disabledButton === "partiallyCompleted"}
    class="flex items-center justify-center px-4 py-1 rounded-lg transition-colors {getButtonClass(
      'Partial',
      disabledButton === 'partiallyCompleted'
    )}"
    title="בוצע חלקית"
  >
    <p class="font-normal text-sm text-right leading-5">בוצע חלקית</p>
  </button>

  <!-- לא בוצע (Not done) Button -->
  <button
    on:click={handleNotDone}
    on:keydown={(e) => handleKeyDown(e, handleNotDone)}
    disabled={disabledButton === "notDone"}
    class="flex items-center justify-center px-4 py-1 rounded-lg transition-colors {getButtonClass(
      'Not Seen',
      disabledButton === 'notDone'
    )}"
    title="לא בוצע"
  >
    <p class="font-normal text-sm text-right leading-5">לא בוצע</p>
  </button>
</div>
