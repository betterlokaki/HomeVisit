<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let disabledButton: string | null = null;

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
</script>

<div class="flex gap-2 items-center">
  <!-- בוצע (Completed) Button -->
  <button
    on:click={handleCompleted}
    on:keydown={(e) => handleKeyDown(e, handleCompleted)}
    disabled={disabledButton === "completed"}
    class="border border-green-500 {disabledButton === 'completed'
      ? 'bg-gray-600 cursor-not-allowed opacity-50'
      : 'bg-green-500 hover:bg-green-600'} flex items-center justify-center px-4 py-1 rounded-lg transition-colors"
    title={disabledButton === "completed" ? "לא זמין בסטטוס זה" : "בוצע"}
  >
    <p class="font-normal text-sm text-white text-right leading-5">בוצע</p>
  </button>

  <!-- בוצע חלקית (Partially Completed) Button -->
  <button
    on:click={handlePartiallyCompleted}
    on:keydown={(e) => handleKeyDown(e, handlePartiallyCompleted)}
    class="border border-yellow-500 bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center px-4 py-1 rounded-lg transition-colors"
    title="בוצע חלקית"
  >
    <p class="font-normal text-sm text-white text-right leading-5">
      בוצע חלקית
    </p>
  </button>

  <!-- לא בוצע (Not done) Button -->
  <button
    on:click={handleNotDone}
    on:keydown={(e) => handleKeyDown(e, handleNotDone)}
    class="border border-red-500 bg-red-500 hover:bg-red-600 flex items-center justify-center px-4 py-1 rounded-lg transition-colors"
    title="לא בוצע"
  >
    <p class="font-normal text-sm text-white text-right leading-5">לא בוצע</p>
  </button>
</div>
