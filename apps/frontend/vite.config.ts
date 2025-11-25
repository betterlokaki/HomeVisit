import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { SERVER_CONFIG } from "./src/config/server";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: SERVER_CONFIG.port,
    host: SERVER_CONFIG.host,
    allowedHosts: SERVER_CONFIG.allowedHosts,
  },
});
