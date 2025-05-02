import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import "./App.css";
import "./styles/markdown.css";
import { router } from "./App";
import { SiteConfigProvider } from "./contexts/SiteConfigContext";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
createRoot(rootElement).render(
  <StrictMode>
    <SiteConfigProvider>
      <RouterProvider router={router} />
    </SiteConfigProvider>
  </StrictMode>
);
