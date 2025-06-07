import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: process.env.VITE_FRONTEND_ALLOWED_HOSTS?.split(",") || [],
  },
  preview: {
    port: 8080,
    host: "0.0.0.0",
    allowedHosts: process.env.VITE_FRONTEND_ALLOWED_HOSTS?.split(",") || [],
  },
});
