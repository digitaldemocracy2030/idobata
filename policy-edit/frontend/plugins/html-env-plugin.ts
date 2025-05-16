import { Plugin } from "vite";

/**
 * Viteプラグイン: 環境変数をHTMLファイルに注入します
 * OGP画像URLなど、HTMLに直接記述される値を環境変数から読み込めるようにします
 */
export function htmlEnvPlugin(): Plugin {
  return {
    name: "html-env-plugin",
    transformIndexHtml(html) {
      const ogpImageUrl =
        process.env.VITE_OGP_IMAGE_URL ||
        "https://delib.takahiroanno.com/idobata.png";

      let updatedHtml = html;

      updatedHtml = updatedHtml.replace(
        /<meta property="og:image" content="[^"]*"/,
        `<meta property="og:image" content="${ogpImageUrl}"`
      );

      updatedHtml = updatedHtml.replace(
        /<meta name="twitter:image" content="[^"]*"/,
        `<meta name="twitter:image" content="${ogpImageUrl}"`
      );

      return updatedHtml;
    },
  };
}
