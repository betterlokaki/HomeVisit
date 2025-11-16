<script lang="ts">
  /**
   * SiteList Component
   * 
   * Displays a scrollable list of sites with status badges and quick actions.
   * Emits events for site selection and status changes.
   * 
   * Props:
   * - sites: Array of Site objects to display
   * - selectedSiteId: Current selected site ID (null if none selected)
   */

  import { createEventDispatcher } from 'svelte';
  import type { Site } from '../stores/sites';
  import SiteCard from './SiteCard.svelte';

  export let sites: Site[] = [];
  export let selectedSiteId: number | null = null;

  const dispatch = createEventDispatcher<{
    selectSite: number;
    statusChange: { siteId: number; status: string };
  }>();

</script>

<div class="site-list">
  <div class="list-header">
    <h2>Sites ({sites.length})</h2>
  </div>
  <div class="list-content">
    {#each sites as site (site.site_id)}
      <SiteCard
        {site}
        isSelected={selectedSiteId === site.site_id}
        on:selectSite={() => dispatch('selectSite', site.site_id)}
        on:statusChange={(e) => dispatch('statusChange', { siteId: site.site_id, status: e.detail })}
      />
    {/each}
  </div>
</div>

<style>
  .site-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f9fafb;
  }

  .list-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: white;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .list-header h2 {
    margin: 0;
    font-size: 1.2rem;
    color: #1f2937;
    font-weight: 600;
  }

  .list-content {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .list-content::-webkit-scrollbar {
    width: 8px;
  }

  .list-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .list-content::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }

  .list-content::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
</style>
