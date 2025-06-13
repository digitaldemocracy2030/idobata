import fs from "node:fs";
import path from "node:path";
import compression from "compression";
import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";

const port = process.env.PORT || 3000;

async function createServer() {
  const app = express();

  app.use(compression());
  app.use(express.static(path.resolve("dist/client")));

  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl;

      const template = fs.readFileSync(
        path.resolve("dist/client/index.html"),
        "utf-8"
      );

      const { App } = await import("./src/App.jsx");
      const { siteConfig } = await import("./src/config/siteConfig.js");
      const { generatePageMeta } = await import("./src/utils/metaGenerator.js");

      const meta = generatePageMeta(url, siteConfig);

      const html = renderToString(
        React.createElement(
          StaticRouter,
          { location: url },
          React.createElement(App)
        )
      );

      const finalHtml = template
        .replace("<!--ssr-outlet-->", html)
        .replace("<title>いどばた政策</title>", `<title>${meta.title}</title>`)
        .replace(
          `<meta property="og:title" content="いどばた政策" />`,
          `<meta property="og:title" content="${meta.title}" />`
        )
        .replace(
          `<meta name="twitter:title" content="いどばた政策" />`,
          `<meta name="twitter:title" content="${meta.title}" />`
        )
        .replace(
          `<meta name="description" content="市民が集まって対話し、政策を生み出すプラットフォーム「いどばた政策」" />`,
          `<meta name="description" content="${meta.description}" />`
        )
        .replace(
          `<meta property="og:description" content="市民が集まって対話し、政策を生み出すプラットフォーム" />`,
          `<meta property="og:description" content="${meta.description}" />`
        )
        .replace(
          `<meta name="twitter:description" content="市民が集まって対話し、政策を生み出すプラットフォーム" />`,
          `<meta name="twitter:description" content="${meta.description}" />`
        );

      res.status(200).set({ "Content-Type": "text/html" }).end(finalHtml);
    } catch (e) {
      console.error("SSR Error:", e.stack);
      res.status(500).end(e.stack);
    }
  });

  return { app };
}

createServer().then(({ app }) =>
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
  })
);
