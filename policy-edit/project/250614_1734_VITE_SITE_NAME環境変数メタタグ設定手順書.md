# VITE_SITE_NAME環境変数を使用したog:title動的設定実装手順書

## 概要

policy-edit/frontendアプリケーションで、環境変数`VITE_SITE_NAME`を使用してHTMLの初期配信時に適切なog:titleを設定する実装手順書です。

## 現状の問題

- `index.html`のog:titleが固定値「いどばた政策」になっている
- JavaScript無効時でも適切なメタタグが設定される必要がある
- 環境変数による動的なサイト名設定ができていない

## 実装アプローチ

**vite-plugin-html使用**:
- ビルド時にHTMLテンプレートを変換
- 環境変数をHTMLに直接注入
- バックエンド変更不要
- JavaScript無効でも機能

## 実装手順

### ステップ1: 依存関係の追加

```bash
cd policy-edit/frontend
npm install --save-dev vite-plugin-html
```

### ステップ2: Vite設定の更新

`policy-edit/frontend/vite.config.ts`を以下のように更新：

```typescript
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
          siteDescription: process.env.VITE_SITE_DESCRIPTION || "市民が集まって対話し、政策を生み出すプラットフォーム",
          siteUrl: process.env.VITE_SITE_URL || "https://delib.takahiroanno.com/",
          siteImageUrl: process.env.VITE_SITE_IMAGE_URL || "https://delib.takahiroanno.com/idobata.png",
          faviconUrl: process.env.VITE_FAVICON_URL || "/vite.svg"
        }
      }
    })
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
```

### ステップ3: HTMLテンプレートの更新

`policy-edit/frontend/index.html`を以下のように更新：

```html
<!doctype html>
<html lang="ja">

<head>
  <meta charset="UTF-8" />

  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><%- siteName %></title>
  <meta name="description" content="<%- siteDescription %>" />

  <!-- ——— Open Graph ——— -->
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="ja_JP" />
  <meta property="og:title" content="<%- siteName %>" />
  <meta property="og:description" content="<%- siteDescription %>" />
  <meta property="og:url" content="<%- siteUrl %>" />
  <meta property="og:image" content="<%- siteImageUrl %>" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="<%- siteName %>" />

  <!-- ——— X (Twitter) Card ——— -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="<%- siteName %>" />
  <meta name="twitter:description" content="<%- siteDescription %>" />
  <meta name="twitter:image" content="<%- siteImageUrl %>" />
  <meta name="twitter:image:alt" content="<%- siteName %>" />

  <!-- ——— Favicon ——— -->
  <link rel="icon" type="image/svg+xml" href="<%- faviconUrl %>" />

</head>

<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>

</html>
```

### ステップ4: 環境変数の設定

プロジェクトルートの`.env`ファイルに以下の環境変数を追加（既存の設定を確認・更新）：

```bash
# Site Configuration for Policy Edit Frontend
VITE_SITE_NAME="チームみらいマニフェストver.0.2"
VITE_SITE_DESCRIPTION="市民が集まって対話し、政策を生み出すプラットフォーム"
VITE_SITE_URL="https://delib.takahiroanno.com/"
VITE_SITE_IMAGE_URL="https://delib.takahiroanno.com/idobata.png"
VITE_FAVICON_URL="https://team-mir.ai/favicon/favicon.ico"
```

### ステップ5: ビルドとテスト

1. **開発環境での確認**
```bash
cd policy-edit/frontend
npm run dev
```

2. **ビルドの実行**
```bash
npm run build
```

3. **ビルド結果の確認**
```bash
npm run preview
```

4. **HTMLソースの確認**
ブラウザで「ページのソースを表示」し、以下が正しく設定されていることを確認：
- `<title>`タグに環境変数の値が設定されている
- `og:title`に環境変数の値が設定されている
- `twitter:title`に環境変数の値が設定されている

## 実装後の効果

### 即座に得られる効果
- 環境変数による動的なサイト名設定
- JavaScript無効でも適切なメタタグ表示
- ビルド時にHTMLが生成されるため高速な初期表示

### 設定可能な環境変数
- `VITE_SITE_NAME`: サイト名
- `VITE_SITE_DESCRIPTION`: サイト説明
- `VITE_SITE_URL`: サイトURL
- `VITE_SITE_IMAGE_URL`: OGP画像URL
- `VITE_FAVICON_URL`: ファビコンURL

## 将来の拡張計画

### フェーズ2: ページ別動的メタタグ
React Helmetを使用して、ページ内容に応じた動的なメタタグ設定を実装：

```typescript
// 実装例
function ContentExplorer({ initialPath }: { initialPath: string }) {
  const siteName = siteConfig.siteName;
  const pageTitle = initialPath
    ? `${initialPath} - ${siteName}`
    : siteName;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} />
        <meta name="twitter:title" content={pageTitle} />
      </Helmet>
      {/* コンポーネント内容 */}
    </>
  );
}
```

### フェーズ3: コンテンツベース動的メタタグ
ファイル内容やMarkdownのH1タグから自動的にタイトルを抽出：

```typescript
// 実装例
function generatePageTitle(content: GitHubFile, siteName: string): string {
  if (content.name.endsWith('.md')) {
    const markdownContent = decodeBase64Content(content.content);
    const h1Match = markdownContent.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return `${h1Match[1]} - ${siteName}`;
    }
  }
  return `${content.name} - ${siteName}`;
}
```

## トラブルシューティング

### よくある問題と解決方法

1. **環境変数が反映されない**
   - `.env`ファイルの場所を確認（プロジェクトルート）
   - 環境変数名が`VITE_`で始まっているか確認
   - 開発サーバーを再起動

2. **HTMLテンプレートの構文エラー**
   - `<%- variable %>`の構文が正しいか確認
   - 変数名がvite.config.tsの設定と一致しているか確認

3. **ビルドエラー**
   - `vite-plugin-html`が正しくインストールされているか確認
   - TypeScriptの型エラーがないか確認

## 検証方法

### 1. 開発環境での確認
```bash
cd policy-edit/frontend
npm run dev
```
ブラウザで http://localhost:5174 にアクセスし、ページタイトルが環境変数の値になっていることを確認

### 2. 本番ビルドでの確認
```bash
npm run build
npm run preview
```
ビルド済みファイルでも同様に動作することを確認

### 3. HTMLソースの直接確認
ブラウザの「ページのソースを表示」で、HTMLに直接メタタグが埋め込まれていることを確認

### 4. SNSシェアテスト
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator

## まとめ

この実装により、以下が実現されます：

1. **環境変数による動的サイト名設定**: `VITE_SITE_NAME`でサイト名を一元管理
2. **JavaScript無効対応**: HTMLの初期配信時からメタタグが設定済み
3. **SEO最適化**: 適切なメタタグによる検索エンジン最適化
4. **SNS最適化**: OGPタグによるソーシャルメディア最適化
5. **バックエンド変更不要**: フロントエンドのビルドプロセスのみで実現

将来的には、React Helmetを使用したページ別動的メタタグやコンテンツベースの動的タイトル生成に拡張可能です。
