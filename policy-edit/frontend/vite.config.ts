import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    createHtmlPlugin({
      inject: {
        data: {
          siteName: process.env.VITE_SITE_NAME || "いどばた政策",
          siteDescription:
            process.env.VITE_SITE_DESCRIPTION ||
            "市民が集まって対話し、政策を生み出すプラットフォーム",
          siteUrl: process.env.VITE_SITE_URL || "",
          siteImageUrl: process.env.VITE_SITE_OG_IMAGE_URL || "",
          faviconUrl: process.env.VITE_FAVICON_URL || "/vite.svg",
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts:
      process.env.VITE_POLICY_FRONTEND_ALLOWED_HOSTS?.split(",") || [],
  },
});
