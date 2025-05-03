# いどばたフロントエンドデザインガイドライン

## 目次

1. [はじめに](#はじめに)
2. [使用ライブラリとフレームワーク](#使用ライブラリとフレームワーク)
3. [コンポーネント構成](#コンポーネント構成)
4. [フォントと色の管理](#フォントと色の管理)
5. [レイアウトとスペーシング](#レイアウトとスペーシング)
6. [UIコンポーネント](#uiコンポーネント)
7. [レスポンシブデザイン](#レスポンシブデザイン)
8. [アクセシビリティ](#アクセシビリティ)
9. [ベストプラクティス](#ベストプラクティス)

## はじめに

このガイドラインは、いどばたフロントエンドの一貫性のあるデザイン実装を促進するために作成されました。Topページを基準として、今後の開発においてデザインの一貫性を保ちながら、拡張性と保守性の高いコードベースを構築するための指針を提供します。

## 使用ライブラリとフレームワーク

### コアライブラリ

- **React**: UIコンポーネントの構築
- **TypeScript**: 型安全な開発環境の提供
- **React Router**: アプリケーションのルーティング
- **Tailwind CSS**: ユーティリティファーストのスタイリング
- **shadcn/ui**: 高品質なUIコンポーネントライブラリ
- **Lucide**: モダンでシンプルなアイコンライブラリ

### 開発ツール

- **Vite**: 高速な開発環境と最適化されたビルド
- **Biome**: コード整形とリンティング

## コンポーネント構成

### コンポーネント階層

コンポーネントは以下の階層に分類して管理します：

1. **レイアウトコンポーネント**
   - アプリケーション全体のレイアウトを定義
   - 例: `PageLayout`, `AppLayout`

2. **ページコンポーネント**
   - 特定のルートに対応するページ全体
   - 例: `Top`, `ThemeDetail`

3. **テンプレートコンポーネント**
   - 複数のページで再利用可能なセクションのテンプレート
   - 例: `ThemeDetailTemplate`

4. **機能コンポーネント**
   - 特定の機能を持つ複合コンポーネント
   - 例: `HeroSection`, `FloatingChat`

5. **基本コンポーネント**
   - 最小単位の再利用可能なUI要素
   - 例: `Button`, `Card`, `Input`

### ディレクトリ構造の改善案

```
src/
├── components/
│   ├── common/         # 共通の基本コンポーネント
│   │   ├── Button/
│   │   ├── Card/
│   │   └── Input/
│   ├── layout/         # レイアウト関連コンポーネント
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── PageLayout.tsx
│   ├── theme/          # テーマ関連コンポーネント
│   ├── chat/           # チャット関連コンポーネント
│   └── home/           # ホーム画面関連コンポーネント
├── hooks/              # カスタムフック
├── contexts/           # Reactコンテキスト
├── services/           # APIサービスなど
├── pages/              # ページコンポーネント
├── styles/             # グローバルスタイルとテーマ設定
│   ├── theme.ts        # テーマ設定（色、フォントなど）
│   └── global.css      # グローバルスタイル
└── utils/              # ユーティリティ関数
```

## フォントと色の管理

### フォント

- **基本フォント**: BIZ UDGothic
- **フォントウェイト**:
  - Regular (400): 通常のテキスト
  - Bold (700): 見出しや強調テキスト

### 色管理の改善案

現状では直接カラーコードを使用している箇所がありますが、shadcnのデフォルトカラーテーマ（紫色）を採用し、Tailwindの設定で一元管理することを推奨します：

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
    },
  },
}
```

これにより、ハードコードされた色値（例: `bg-[#EADFFF]`）を意味のある名前（例: `bg-primary`）に置き換えることができます。

### 色の使用ガイドライン

- **テキスト**:
  - 本文: foreground (`text-foreground`)
  - 見出し: foreground (`text-foreground`)
  - リンク: primary (`text-primary`)

- **背景**:
  - ページ背景: background (`bg-background`)
  - セクション背景: secondary (`bg-secondary`)
  - カード背景: card (`bg-card`)

- **アクセント**:
  - ボタン: primary (`bg-primary`)
  - ハイライト: accent (`bg-accent`)

## レイアウトとスペーシング

### コンテナ

ページコンテンツは中央揃えのコンテナ内に配置します：

```jsx
<div className="container mx-auto py-8">
  {/* コンテンツ */}
</div>
```

### スペーシング

一貫したスペーシングを使用するために、Tailwindのスペーシングスケールを活用します：

- **小さいスペース**: 4px (`p-1`, `m-1`)
- **標準スペース**: 16px (`p-4`, `m-4`)
- **大きいスペース**: 32px (`p-8`, `m-8`)
- **セクション間**: 64px (`gap-16`)

### レイアウトパターン

- **フレックスボックス**を使用して要素を水平・垂直に配置
  - `flex`: フレックスコンテナを作成
  - `flex-col`: 縦方向に配置
  - `flex-row`: 横方向に配置
  - `gap-{size}`: 要素間のスペース

- **グリッド**を使用して複雑なレイアウトを構築
  - `grid`: グリッドコンテナを作成
  - `grid-cols-{n}`: 列数を指定
  - `md:grid-cols-{n}`: 特定のブレイクポイントでの列数

- **パディング**と**マージン**を一貫して適用
  - `p-{size}`: パディング
  - `m-{size}`: マージン
  - `px-{size}`, `py-{size}`: 水平・垂直方向のパディング

## UIコンポーネント

### shadcn/uiコンポーネント

shadcn/uiを活用して、一貫性のあるUIコンポーネントを構築します。以下は主要なコンポーネントとその使用方法です：

#### ボタン

shadcnのButtonコンポーネントを使用し、様々なバリエーションを活用します：

- **バリアント**: default, destructive, outline, secondary, ghost, link
- **サイズ**: default, sm, lg, icon

```jsx
import { Button } from "@/components/ui/button";

// 使用例
<Button variant="default">ボタン</Button>
<Button variant="outline" size="sm">小さいボタン</Button>
<Button variant="ghost" size="icon"><IconName /></Button>
```

#### カード

情報を表示するためのカードコンポーネント：

- **Card**: カードのコンテナ
- **CardHeader**: カードのヘッダー部分
- **CardTitle**: カードのタイトル
- **CardDescription**: カードの説明
- **CardContent**: カードの主要コンテンツ
- **CardFooter**: カードのフッター部分

```jsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
```

#### シート（モーダル/ドロワー）

サイドから表示されるパネルコンポーネント：

- **Sheet**: シートのコンテナ
- **SheetTrigger**: シートを開くトリガー
- **SheetContent**: シートの内容
- **SheetHeader**: シートのヘッダー
- **SheetTitle**: シートのタイトル
- **SheetDescription**: シートの説明
- **SheetFooter**: シートのフッター
- **SheetClose**: シートを閉じるボタン

```jsx
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
```

### Lucideアイコン

Lucideアイコンライブラリを使用して、一貫性のあるアイコンを実装します：

```jsx
import { MessageSquare, ArrowRight, Send } from "lucide-react";

// 使用例
<MessageSquare className="w-4 h-4" />
<ArrowRight className="ml-2" />
```

### カスタムコンポーネント

プロジェクト固有のコンポーネントは、shadcn/uiコンポーネントを基盤として構築します：

#### セクションコンポーネント

```jsx
// 使用例
<Section 
  title="セクションタイトル" 
  description="セクションの説明文"
>
  {/* コンテンツ */}
</Section>
```

## レスポンシブデザイン

### ブレイクポイント

Tailwindのデフォルトブレイクポイントを使用します：

- **sm**: 640px以上
- **md**: 768px以上
- **lg**: 1024px以上
- **xl**: 1280px以上
- **2xl**: 1536px以上

### レスポンシブパターン

- **モバイルファースト**アプローチを採用
- 基本スタイルはモバイル向けに設定し、ブレイクポイントを使用して大きな画面に対応
- レスポンシブクラスの命名規則:
  - デフォルト: 全画面サイズに適用（例: `grid-cols-1`）
  - ブレイクポイント接頭辞: 特定の画面サイズ以上に適用（例: `md:grid-cols-2`）

このガイドラインは、いどばたフロントエンドの一貫性と品質を確保するための基盤となります。プロジェクトの成長に合わせて継続的に更新し、チーム全体で共有することで、効率的な開発と高品質なユーザー体験を実現します。
