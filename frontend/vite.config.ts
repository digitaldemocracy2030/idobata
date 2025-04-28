import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // idea-discussion/backendのCORS設定に合わせたポート
    host: "0.0.0.0",
  },
});
