/**
 * Svelte App Entry Point
 * 
 * Bootstraps the Svelte application by mounting the root App component
 * to the #app DOM element. This file is the entry point for Vite.
 */

import App from './App.svelte';

const app = new App({
  target: document.getElementById('app')!
});

export default app;
