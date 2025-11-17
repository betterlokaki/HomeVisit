<script lang="ts">
  /**
   * Dashboard Page
   *
   * Main application view showing sites list and map.
   * Allows authenticated users to view and manage their sites.
   */

  import { currentUser, authStore } from "../stores/auth";
  import { sitesStore, selectedSite } from "../stores/sites";
  import SiteList from "../components/SiteList.svelte";
  import Map from "../components/Map.svelte";

  function handleLogout() {
    authStore.logout();
  }

  async function handleStatusUpdate(
    event: CustomEvent<{ siteId: number; newStatus: string }>
  ) {
    const { siteId, newStatus } = event.detail;
    try {
      sitesStore.updateSiteStatus(
        siteId,
        newStatus as "Seen" | "Partial" | "Not Seen"
      );
    } catch (err) {
      console.error("Failed to update site status", err);
    }
  }
</script>

<div class="dashboard">
  <header class="dashboard-header">
    <div class="header-content">
      <h1>HomeVisit</h1>
      {#if $currentUser.id}
        <p class="user-info">
          User ID: <strong>{$currentUser.id}</strong> | Group:
          <strong>{$currentUser.groupId}</strong>
        </p>
      {/if}
    </div>
    <button class="logout-btn" on:click={handleLogout} title="Logout">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M16 17l5-5m0 0l-5-5m5 5H9"
        />
      </svg>
      Logout
    </button>
  </header>

  <main class="dashboard-main">
    {#if $sitesStore.loading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading sites...</p>
      </div>
    {:else if $sitesStore.error}
      <div class="error-container">
        <p class="error-message">{$sitesStore.error}</p>
        <button on:click={() => sitesStore.clearError()}>Dismiss</button>
      </div>
    {:else if $sitesStore.sites.length === 0}
      <div class="empty-state">
        <p>No sites assigned to your account.</p>
        <p>Contact your administrator to add sites.</p>
      </div>
    {:else}
      <div class="layout">
        <aside class="sidebar">
          <SiteList
            sites={$sitesStore.sites}
            selectedSiteId={$sitesStore.selectedSiteId}
            on:selectSite={(e) => sitesStore.selectSite(e.detail)}
            on:statusChanged={handleStatusUpdate}
          />
        </aside>
        <section class="map-container">
          <Map
            sites={$sitesStore.sites}
            selectedSiteId={$sitesStore.selectedSiteId}
          />
        </section>
      </div>
    {/if}
  </main>
</div>

<style>
  .dashboard {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #fff;
  }

  .dashboard-header {
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-content h1 {
    font-size: 1.8rem;
    font-weight: 600;
    margin: 0;
  }

  .user-info {
    margin-top: 0.5rem;
    font-size: 0.95rem;
    opacity: 0.95;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    border-radius: 0.375rem;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .logout-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .logout-btn:active {
    transform: scale(0.98);
  }

  .dashboard-main {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .loading,
  .error-container,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #6b7280;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-message {
    color: #dc2626;
    background: #fee2e2;
    padding: 1rem;
    border-radius: 0.375rem;
    margin-bottom: 1rem;
    max-width: 400px;
  }

  .error-container button {
    padding: 0.5rem 1rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 600;
  }

  .error-container button:hover {
    background: #764ba2;
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

    .dashboard-header {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }
  }
</style>
