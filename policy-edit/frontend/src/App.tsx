import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ContentExplorer from "./components/page-specific/ContentExplorer";
import NotFound from "./components/page-specific/NotFound";
import { siteConfig } from "./config/siteConfig";

// Wrapper component to extract path from URL splat and pass it to ContentExplorer
function ContentExplorerWrapper() {
  const params = useParams();
  // Get the path after /view/. If no path, default to empty string (root)
  const path = params["*"] || "";
  // Use key={path} to force re-render/remount of ContentExplorer when the path changes
  return <ContentExplorer key={path} initialPath={path} />;
}

function App() {
  useEffect(() => {
    document.title = siteConfig.siteName;

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", siteConfig.siteName);
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute("content", siteConfig.siteName);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Route for the repository root */}
          <Route index element={<ContentExplorer initialPath="" />} />
          {/* Route for paths within the repository */}
          <Route path="view/*" element={<ContentExplorerWrapper />} />
          {/* Catch-all route for any other paths (404) */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
