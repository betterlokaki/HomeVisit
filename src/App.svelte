<script lang="ts">
  import { onMount } from 'svelte';
  import axios from 'axios';
  import SiteList from './components/SiteList.svelte';
  import Map from './components/Map.svelte';

  interface Site {
    id: string;
    name: string;
    geometry: {
      type: string;
      coordinates: number[];
    };
    status: 'online' | 'offline' | 'maintenance';
    last_seen: string;
    last_data: string;
  }

  const username = 'shahar'; // hardcoded user
  const postgrestUrl = import.meta.env.VITE_POSTGREST_URL || 'http://localhost:3000';

  let sites: Site[] = [];
  let loading = true;
  let error: string | null = null;
  let selectedSiteId: string | null = null;

  onMount(async () => {
    try {
      // Fetch sites for this user
      const response = await axios.post(`${postgrestUrl}/rpc/get_sites_by_user`, {
        username
      });
      sites = response.data;
    } catch (err: any) {
      error = err.response?.data?.message || 'Failed to load sites';
      console.error(error, err);
    } finally {
      loading = false;
    }
  });

  const handleStatusUpdate = async (siteId: string, newStatus: string) => {
    try {
      await axios.post(`${postgrestUrl}/rpc/update_site_status`, {
        site_id: siteId,
        new_status: newStatus
      });
      // Refetch sites after update
      const response = await axios.post(`${postgrestUrl}/rpc/get_sites_by_user`, {
        username
      });
      sites = response.data;
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };
</script>

<div class="container">
  <header>
    <h1>HomeVisit</h1>
    <p class="subtitle">User: <strong>{username}</strong></p>
  </header>

  {#if loading}
    <div class="loading">Loading sites...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if sites.length === 0}
    <div class="empty">No sites found for {username}</div>
  {:else}
    <main>
      <div class="layout">
        <aside class="sidebar">
          <SiteList {sites} {selectedSiteId} on:select={(e) => (selectedSiteId = e.detail)} on:updateStatus={(e) => handleStatusUpdate(e.detail.siteId, e.detail.status)} />
        </aside>
        <section class="map-container">
          <Map {sites} {selectedSiteId} />
        </section>
      </div>
    </main>
  {/if}
</div>

<style>
  .container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #fff;
  }

  header {
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  header h1 {
    font-size: 1.8rem;
    font-weight: 600;
    margin: 0;
  }

  .subtitle {
    margin-top: 0.5rem;
    font-size: 0.95rem;
    opacity: 0.95;
  }

  main {
    flex: 1;
    overflow: hidden;
  }

  .layout {
    display: flex;
    height: 100%;
    gap: 0;
  }

  .sidebar {
    width: 35%;
    overflow-y: auto;
    border-right: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .map-container {
    flex: 1;
    overflow: hidden;
  }

  .loading,
  .error,
  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 80px);
    font-size: 1.1rem;
    text-align: center;
  }

  .loading {
    color: #667eea;
  }

  .error {
    color: #dc2626;
    background: #fee2e2;
  }

  .empty {
    color: #6b7280;
  }

  @media (max-width: 768px) {
    .layout {
      flex-direction: column;
    }

    .sidebar {
      width: 100%;
      max-height: 40%;
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
    }

    .map-container {
      flex: 1;
    }
  }
</style>
