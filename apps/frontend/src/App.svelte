<script lang="ts">
  /**
   * HomeVisit Main Application
   * 
   * Root component that manages routing between auth pages (login/register)
   * and the main dashboard. Redirects based on authentication state.
   */

  import { onMount } from 'svelte';
  import { isAuthenticated, authStore } from './stores/auth';
  import { sitesStore } from './stores/sites';
  import Login from './pages/Login.svelte';
  import Register from './pages/Register.svelte';
  import Dashboard from './pages/Dashboard.svelte';

  let currentPage: 'login' | 'register' | 'dashboard' = 'login';

  onMount(() => {
    // If already authenticated, go to dashboard
    if ($isAuthenticated && $authStore.userId) {
      currentPage = 'dashboard';
      sitesStore.fetchUserSites($authStore.userId);
    }
  });

  // Watch for auth changes
  $: if ($isAuthenticated && $authStore.userId) {
    currentPage = 'dashboard';
    sitesStore.fetchUserSites($authStore.userId);
  } else if (!$isAuthenticated && currentPage === 'dashboard') {
    currentPage = 'login';
  }

  const handleSwitchPage = (page: 'login' | 'register') => {
    currentPage = page;
  };
</script>

<div class="app">
  {#if currentPage === 'login'}
    <Login on:switchPage={() => handleSwitchPage('register')} />
  {:else if currentPage === 'register'}
    <Register on:switchPage={() => handleSwitchPage('login')} />
  {:else if currentPage === 'dashboard'}
    <Dashboard />
  {/if}
</div>

<style>
  .app {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
</style>
