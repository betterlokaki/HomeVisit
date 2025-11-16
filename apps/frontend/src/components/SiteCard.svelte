<script lang="ts">
  /**
   * SiteCard Component
   * 
   * Displays a single site card with status badge, coordinates, timestamps,
   * and a dropdown to change status. Emits events for selection and status changes.
   * 
   * Props:
   * - site: The Site object to display
   * - isSelected: Whether this site is currently selected
   */

  import { createEventDispatcher } from 'svelte';
  import type { Site } from '../stores/sites';

  export let site: Site;
  export let isSelected: boolean = false;

  const dispatch = createEventDispatcher<{
    selectSite: void;
    statusChange: string;
  }>();

  const statusColors: Record<string, string> = {
    online: '#10b981',
    offline: '#ef4444',
    maintenance: '#f59e0b'
  };

  const handleStatusChange = (e: Event) => {
    const select = e.target as HTMLSelectElement;
    dispatch('statusChange', select.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
</script>

<div class="site-card" class:selected={isSelected} on:click={() => dispatch('selectSite')}>
  <div class="card-header">
    <div class="site-name">{site.name}</div>
    <div class="status-badge" style="background-color: {statusColors[site.status]}">
      {site.status}
    </div>
  </div>

  <div class="card-content">
    <div class="site-id">Code: <code>{site.site_code}</code></div>
    <div class="site-coords">
      Coords: [{site.geometry.coordinates[0].toFixed(4)}, {site.geometry.coordinates[1].toFixed(4)}]
    </div>
    <div class="site-time">
      <div>Last Seen: <span>{formatDate(site.last_seen)}</span></div>
      <div>Last Data: <span>{formatDate(site.last_data)}</span></div>
    </div>
  </div>

  <div class="card-actions">
    <select on:change={handleStatusChange} value={site.status}>
      <option value="online">Online</option>
      <option value="offline">Offline</option>
      <option value="maintenance">Maintenance</option>
    </select>
  </div>
</div>

<style>
  .site-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .site-card:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }

  .site-card.selected {
    border-color: #667eea;
    background: #f0f4ff;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    gap: 1rem;
  }

  .site-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    flex: 1;
  }

  .status-badge {
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .card-content {
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .site-id {
    margin-bottom: 0.5rem;
  }

  code {
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-family: 'Courier New', monospace;
    color: #374151;
    font-size: 0.85em;
  }

  .site-coords {
    margin-bottom: 0.5rem;
    font-family: 'Courier New', monospace;
  }

  .site-time {
    font-size: 0.8rem;
    color: #9ca3af;
  }

  .site-time div {
    margin-bottom: 0.25rem;
  }

  .site-time span {
    display: inline-block;
    margin-left: 0.25rem;
  }

  .card-actions {
    border-top: 1px solid #e5e7eb;
    padding-top: 0.75rem;
  }

  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    background-color: white;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  select:hover {
    border-color: #667eea;
  }

  select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
</style>
