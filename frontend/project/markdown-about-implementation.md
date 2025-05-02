# マークダウン形式のサイト説明実装計画

## 概要

現在のAboutページでは、複数の`AboutSection`コンポーネントを使用して静的なコンテンツを表示しています。この実装を変更し、管理画面から入力された「サイト説明（マークダウン形式）」をHTMLに変換して表示する機能を実装します。

## 現状の課題

1. 現在の`AboutSection`コンポーネントは、タイトルとReact Nodeを受け取り、セクションごとに分割された形で表示しています
2. 管理画面では「サイト説明（マークダウン形式）」としてマークダウン形式のテキストを入力できますが、これをHTMLに変換して表示する機能がありません
3. マークダウンから変換されたHTML要素に対して、適切なスタイリングを適用する必要があります

## 実装方針

### 1. マークダウンライブラリの導入

マークダウンをHTMLに変換するために、以下のライブラリを導入します：

```bash
npm install react-markdown rehype-raw rehype-sanitize remark-gfm
```

- `react-markdown`: マークダウンをReactコンポーネントに変換するライブラリ
- `rehype-raw`: HTMLタグをそのまま処理するプラグイン
- `rehype-sanitize`: セキュリティのためにHTMLをサニタイズするプラグイン
- `remark-gfm`: GitHub Flavored Markdownをサポートするプラグイン

### 2. AboutSectionコンポーネントの廃止と新しいMarkdownRendererコンポーネントの作成

現在の`AboutSection`コンポーネントを廃止し、代わりにマークダウンを表示するための新しいコンポーネントを作成します：

```tsx
// src/components/common/MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "../../lib/utils";

interface MarkdownRendererProps {
  markdown: string;
  className?: string;
}

export function MarkdownRenderer({ markdown, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-neutral max-w-none", className)}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ node, ...props }) => (
            <div className="flex py-2 mb-3">
              <div className="w-1 h-6 bg-primary rounded-full mr-2" />
              <h2 className="text-xl font-bold text-foreground font-biz leading-6" {...props} />
            </div>
          ),
          // 他のHTML要素に対するカスタムコンポーネントをここに追加
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
```

### 3. Aboutページの修正

Aboutページを修正して、管理画面から取得したマークダウンコンテンツを表示するようにします：

```tsx
// src/pages/About.tsx
import { useRef, useEffect, useState } from "react";
import {
  FloatingChat,
  type FloatingChatRef,
} from "../components/chat/FloatingChat";
import BreadcrumbView from "../components/common/BreadcrumbView";
import MarkdownRenderer from "../components/common/MarkdownRenderer";
import { apiClient } from "../services/api/apiClient";

const About = () => {
  const breadcrumbItems = [
    { label: "TOP", href: "/" },
    { label: "このサイトについて", href: "/about" },
  ];

  const chatRef = useRef<FloatingChatRef>(null);
  const [aboutMessage, setAboutMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteConfig = async () => {
      setLoading(true);
      const result = await apiClient.getSiteConfig();

      result.match(
        (data) => {
          setAboutMessage(data.aboutMessage || "");
          setError(null);
        },
        (error) => {
          console.error("Failed to fetch site config:", error);
          setError("サイト設定の取得に失敗しました。");
        }
      );

      setLoading(false);
    };

    fetchSiteConfig();
  }, []);

  const handleSendMessage = (message: string) => {
    console.log("Message sent:", message);

    setTimeout(() => {
      chatRef.current?.addMessage("メッセージを受け取りました。", "system");
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbView items={breadcrumbItems} />

      {loading ? (
        <div className="text-center py-4">読み込み中...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      ) : (
        <MarkdownRenderer markdown={aboutMessage} />
      )}

      <div className="text-center mt-12">
        <a
          href="https://xxparty-policy.com"
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          © xxparty-policy.com
        </a>
      </div>

      <FloatingChat ref={chatRef} onSendMessage={handleSendMessage} />
    </div>
  );
};

export default About;
```

### 4. APIクライアントの修正

APIクライアントに`getSiteConfig`メソッドを追加します（既に存在する場合は不要）：

```tsx
// src/services/api/apiClient.ts に追加
async getSiteConfig(): Promise<HttpResult<SiteConfig>> {
  return this.withRetry(() => this.httpClient.get<SiteConfig>("/site-config"));
}
```

### 5. Tailwind CSSの設定

マークダウンから変換されたHTML要素に適切なスタイルを適用するために、Tailwind CSSの`@tailwindcss/typography`プラグインを導入します：

```bash
npm install -D @tailwindcss/typography
```

そして、`tailwind.config.js`にプラグインを追加します：

```js
// tailwind.config.js
module.exports = {
  // ...
  plugins: [
    // ...
    require('@tailwindcss/typography'),
  ],
}
```

### 6. カスタムスタイリングの適用

マークダウンから変換されたHTML要素に対して、より詳細なスタイリングを適用するために、CSSを追加します：

```css
/* src/styles/markdown.css を作成 */
.prose h2 {
  @apply text-xl font-bold text-foreground font-biz leading-6;
}

.prose h3 {
  @apply text-lg font-semibold mb-2;
}

.prose p {
  @apply mb-4 text-neutral-700;
}

.prose ul {
  @apply list-disc pl-5 mb-4;
}

.prose ol {
  @apply list-decimal pl-5 mb-4;
}

.prose a {
  @apply text-primary hover:text-primary-dark underline;
}

.prose blockquote {
  @apply border-l-4 border-neutral-300 pl-4 italic;
}

.prose code {
  @apply bg-neutral-100 px-1 py-0.5 rounded text-sm;
}

.prose pre {
  @apply bg-neutral-100 p-4 rounded overflow-x-auto;
}

.prose img {
  @apply max-w-full h-auto rounded;
}

.prose table {
  @apply w-full border-collapse mb-4;
}

.prose th, .prose td {
  @apply border border-neutral-300 p-2;
}

.prose th {
  @apply bg-neutral-100;
}
```

そして、このCSSファイルをインポートします：

```tsx
// src/main.tsx または適切なエントリーポイントに追加
import './styles/markdown.css';
```

## 実装の詳細

### H2要素のスタイリング

H2要素には、現在の`SectionHeading`コンポーネントと同様のスタイルを適用します：

1. 左側に縦の青いバー（`bg-primary`）を表示
2. フォントを太字（`font-bold`）に設定
3. フォントサイズを`text-xl`に設定
4. フォントファミリーを`font-biz`に設定

これは、`MarkdownRenderer`コンポーネントの`components`プロパティで、H2要素に対するカスタムコンポーネントを定義することで実現します。

### その他のHTML要素のスタイリング

その他のHTML要素（H3, P, UL, OL, A, BLOCKQUOTE, CODE, PRE, IMG, TABLE）に対しても、適切なスタイリングを適用します。これは、Tailwind CSSの`@tailwindcss/typography`プラグインと、カスタムCSSを組み合わせて実現します。

## セキュリティ対策

マークダウンからHTMLへの変換時に、悪意のあるスクリプトが実行されないように、`rehype-sanitize`プラグインを使用してHTMLをサニタイズします。

## フォールバック対策

管理画面からマークダウンが設定されていない場合は、デフォルトのメッセージを表示するか、または何も表示しないようにします。

## 今後の拡張性

この実装により、以下のような拡張が容易になります：

1. マークダウンエディタの導入（管理画面でのプレビュー機能）
2. シンタックスハイライトの追加（コードブロック用）
3. カスタムマークダウン記法の追加

## まとめ

この実装により、管理画面から入力されたマークダウン形式のテキストを、適切にスタイリングされたHTMLとしてAboutページに表示することができます。現在の`AboutSection`コンポーネントを廃止し、より柔軟なマークダウンベースの表示に移行することで、コンテンツの管理が容易になります。
