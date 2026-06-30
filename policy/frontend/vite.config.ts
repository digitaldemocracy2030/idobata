import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 明示的に環境変数を読み込む（システム環境変数より.envファイルを優先）
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      createHtmlPlugin({
        inject: {
          data: {
            siteName: env.VITE_SITE_NAME || "いどばた政策",
            siteDescription:
              env.VITE_SITE_DESCRIPTION ||
              "市民が集まって対話し、政策を生み出すプラットフォーム",
            siteUrl: env.VITE_SITE_URL || "",
            siteImageUrl: env.VITE_SITE_OG_IMAGE_URL || "",
            faviconUrl: env.VITE_FAVICON_URL || "/vite.svg",
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
      allowedHosts: env.VITE_POLICY_FRONTEND_ALLOWED_HOSTS?.split(",") || [],
    },
  };
});
