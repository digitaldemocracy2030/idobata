import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App";
import { siteConfig } from "./config/siteConfig";
import { generatePageMeta } from "./utils/metaGenerator";

export function render(url: string) {
  const meta = generatePageMeta(url, siteConfig);

  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );

  return { html, meta };
}
