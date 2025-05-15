import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { htmlEnvPlugin } from "./plugins/html-env-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), htmlEnvPlugin()],
  server: {
    allowedHosts:
      process.env.VITE_POLICY_FRONTEND_ALLOWED_HOSTS?.split(",") || [],
  },
});
