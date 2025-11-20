<script lang="ts">
  import { createEventDispatcher } from "svelte";

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
    class="border border-gray-400 bg-white hover:bg-gray-50 flex items-center justify-center px-4 py-1 rounded-lg transition-colors"
    title="בוצע"
  >
    <p class="font-normal text-sm text-gray-800 text-right leading-5">בוצע</p>
  </button>

  <!-- בוצע חלקית (Partially Completed) Button -->
  <button
    on:click={handlePartiallyCompleted}
    on:keydown={(e) => handleKeyDown(e, handlePartiallyCompleted)}
    class="border border-gray-400 bg-white hover:bg-gray-50 flex items-center justify-center px-4 py-1 rounded-lg transition-colors"
    title="בוצע חלקית"
  >
    <p class="font-normal text-sm text-gray-800 text-right leading-5">
      בוצע חלקית
    </p>
  </button>
</div>
