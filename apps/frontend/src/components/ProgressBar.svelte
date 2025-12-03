<!--
  ProgressBar Component
  Displays visit progress with completed/total count
  Single responsibility: render progress visualization
-->

<script lang="ts">
  export let completedCount: number = 0;
  export let totalCount: number = 0;

  $: progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
</script>

<div class="mt-2 px-1">
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
    <span class="text-xs text-gray-500">
      {completedCount} מתוך {totalCount} הושלמו
    </span>
  </div>
</div>
