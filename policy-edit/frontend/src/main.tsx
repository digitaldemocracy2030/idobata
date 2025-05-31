import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { injectCSSVariables } from "./utils/cssVariables";

// 環境変数のデバッグ（policy-edit main.tsx）
console.log("=== Policy-Edit main.tsx Environment Variables Debug ===");
console.log("VITE_SITE_NAME:", import.meta.env.VITE_SITE_NAME);
console.log("VITE_SITE_LOGO_URL:", import.meta.env.VITE_SITE_LOGO_URL);
console.log("VITE_PRIMARY_COLOR:", import.meta.env.VITE_PRIMARY_COLOR);
console.log("All import.meta.env:", import.meta.env);
console.log("========================================================");

// CSS変数を動的に注入
injectCSSVariables();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
