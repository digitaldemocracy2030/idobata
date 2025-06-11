import fs from "node:fs";
import path from "node:path";
import compression from "compression";
import express from "express";
import { createServer as createViteServer } from "vite";

const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 3000;

async function createServer() {
  const app = express();

  app.use(compression());

  let vite;

  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve("dist/client")));
  }

  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl;

      let template;
      let render;

      if (!isProduction && vite) {
        template = fs.readFileSync(path.resolve("index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
      } else {
        template = fs.readFileSync(
          path.resolve("dist/client/index.html"),
          "utf-8"
        );
        const serverModule = await import(
          path.resolve("dist/server/entry-server.js")
        );
        render = serverModule.render;
      }

      const { html, meta } = render(url);

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
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error(e.stack);
      res.status(500).end(e.stack);
    }
  });

  return { app, vite };
}

createServer().then(({ app }) =>
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
  })
);
