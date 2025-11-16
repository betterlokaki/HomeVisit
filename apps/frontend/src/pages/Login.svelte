<script lang="ts">
  /**
   * Login Page
   * 
   * Allows users to authenticate with their username only.
   * Provides a link to the registration page for new users.
   */

  import { createEventDispatcher } from 'svelte';
  import { authStore } from '../stores/auth';

  const dispatch = createEventDispatcher();

  let username = '';
  let isLoading = false;

  async function handleLogin() {
    if (!username.trim()) {
      alert('Please enter your username');
      return;
    }

    isLoading = true;
    try {
      await authStore.login(username);
      // Navigation happens via App.svelte reactivity
    } catch (err) {
      // Error is already in authStore.error
    } finally {
      isLoading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<div class="login-container">
  <div class="login-card">
    <div class="header">
      <h1>HomeVisit</h1>
      <p>Site Management System</p>
    </div>

    <form on:submit|preventDefault={handleLogin}>
      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          type="text"
          placeholder="Enter your username"
          bind:value={username}
          disabled={isLoading}
          on:keydown={handleKeydown}
        />
      </div>

      {#if $authStore.error}
        <div class="error-message">
          {$authStore.error}
        </div>
      {/if}

      <button type="submit" disabled={isLoading || !username.trim()}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>

    <div class="footer">
      <p>
        Don't have an account?
        <button
          type="button"
          class="link-button"
          on:click={() => dispatch('switchPage')}
          disabled={isLoading}
        >
          Register here
        </button>
      </p>
    </div>
  </div>
</div>

<style>
  .login-container {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .login-card {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    padding: 3rem;
    width: 100%;
    max-width: 400px;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #667eea;
    margin: 0;
  }

  .header p {
    color: #6b7280;
    font-size: 0.95rem;
    margin-top: 0.5rem;
  }

  form {
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #1f2937;
    font-size: 0.95rem;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.375rem;
    font-size: 1rem;
    transition: all 0.2s;
    font-family: inherit;
  }

  input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  input:disabled {
    background-color: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }

  button[type='submit'] {
    width: 100%;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  button[type='submit']:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.2);
  }

  button[type='submit']:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    background-color: #fee2e2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .footer {
    text-align: center;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .footer p {
    color: #6b7280;
    font-size: 0.9rem;
    margin: 0;
  }

  .link-button {
    background: none;
    border: none;
    color: #667eea;
    text-decoration: none;
    cursor: pointer;
    font-weight: 600;
    padding: 0;
    font-size: inherit;
    transition: color 0.2s;
  }

  .link-button:hover:not(:disabled) {
    color: #764ba2;
    text-decoration: underline;
  }

  .link-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
