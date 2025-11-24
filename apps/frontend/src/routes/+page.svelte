<script lang="ts">
  import { onMount } from "svelte";
  import { API_CONFIG } from "../config/env";

  interface Group {
    group_name: string;
  }

  let groups: Group[] = [];
  let loading = false;
  let error: string | null = null;

  onMount(async () => {
    loading = true;
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/sites/groups`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: { groups: Group[] } = await response.json();
      console.log(data);
      groups = data.groups || [];
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load groups";
      console.error("Failed to load groups:", err);
    } finally {
      loading = false;
    }
  });
</script>

<div
  class="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4"
  dir="rtl"
>
  <div class="max-w-2xl w-full">
    <!-- Title -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-white mb-2">ביקורי אתרים</h1>
      <p class="text-gray-400">בחר קבוצה להתחיל</p>
    </div>

    <!-- Loading State -->
    {#if loading}
      <div class="flex flex-col gap-4 items-center justify-center py-12">
        <div class="animate-spin">
          <div
            class="w-12 h-12 border-4 border-gray-800 border-t-blue-600 rounded-full"
          />
        </div>
        <p class="text-gray-400">טוען קבוצות...</p>
      </div>
    {/if}

    <!-- Error State -->
    {#if error && !loading}
      <div
        class="bg-red-900 border border-red-700 rounded-lg p-4 mb-6 text-red-200"
      >
        <p class="font-semibold">שגיאה בטעינת קבוצות</p>
        <p class="text-sm mt-1">{error}</p>
      </div>
    {/if}

    <!-- Groups Grid -->
    {#if !loading && groups.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each groups as group (group.group_name)}
          <a
            href="/group/{encodeURIComponent(group.group_name)}"
            class="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-colors border border-gray-700 hover:border-blue-600"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-white">
                {group.group_name}
              </h2>
              <div class="text-2xl">→</div>
            </div>
            <p class="text-gray-400 text-sm mt-2">לחץ להתחיל</p>
          </a>
        {/each}
      </div>
    {/if}

    <!-- Empty State -->
    {#if !loading && groups.length === 0 && !error}
      <div class="flex flex-col gap-4 items-center justify-center py-12">
        <div class="text-6xl">📭</div>
        <p class="text-xl font-semibold text-white">לא נמצאו קבוצות</p>
        <p class="text-gray-400">אנא בדוק עם המנהל</p>
      </div>
    {/if}
  </div>
</div>
