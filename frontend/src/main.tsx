import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import "./App.css";
import "./styles/markdown.css";
import { router } from "./App";
import { SiteConfigProvider } from "./contexts/SiteConfigContext";
import { injectCSSVariables } from "./utils/cssVariables";

// 環境変数のデバッグ（main.tsx）
console.log("=== main.tsx Environment Variables Debug ===");
console.log("VITE_SITE_NAME:", import.meta.env.VITE_SITE_NAME);
console.log("VITE_SITE_LOGO_URL:", import.meta.env.VITE_SITE_LOGO_URL);
console.log("VITE_PRIMARY_COLOR:", import.meta.env.VITE_PRIMARY_COLOR);
console.log("All import.meta.env:", import.meta.env);
console.log("===========================================");

// CSS変数を動的に注入
injectCSSVariables();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
createRoot(rootElement).render(
  <StrictMode>
    <SiteConfigProvider>
      <RouterProvider router={router} />
    </SiteConfigProvider>
  </StrictMode>
);
