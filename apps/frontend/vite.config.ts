import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import dotenv from "dotenv";
dotenv.config();
export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 80,
    host: "0.0.0.0",
    allowedHosts: process.env
      .VITE_ALLOWED_HOSTS!.split(",")
      .map((h) => h.trim()),
  },
});
