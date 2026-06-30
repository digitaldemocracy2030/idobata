# いどばた管理画面デザインガイドライン

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

このガイドラインは、いどばた管理画面の一貫性のあるデザイン実装を促進するために作成されました。現在の管理画面を基準として、今後の開発においてデザインの一貫性を保ちながら、拡張性と保守性の高いコードベースを構築するための指針を提供します。

## 使用ライブラリとフレームワーク

### コアライブラリ

- **React**: UIコンポーネントの構築
- **TypeScript**: 型安全な開発環境の提供
- **React Router**: アプリケーションのルーティング
- **Tailwind CSS**: ユーティリティファーストのスタイリング
- **shadcn/ui**: 高品質なUIコンポーネントライブラリ（violetテーマを採用）
- **Lucide**: モダンでシンプルなアイコンライブラリ

### 開発ツール

- **Vite**: 高速な開発環境と最適化されたビルド
- **Biome**: コード整形とリンティング

## コンポーネント構成

### コンポーネント階層

コンポーネントは以下の階層に分類して管理します：

1. **レイアウトコンポーネント**
   - アプリケーション全体のレイアウトを定義
   - 例: `Header`, `Sidebar`, `MainContent`

2. **ページコンポーネント**
   - 特定のルートに対応するページ全体
   - 例: `Dashboard`, `ThemeList`, `ThemeEdit`

3. **機能コンポーネント**
   - 特定の機能を持つ複合コンポーネント
   - 例: `ThemeForm`, `ThemeTable`, `SiteConfigForm`

4. **基本コンポーネント**
   - 最小単位の再利用可能なUI要素
   - 例: `Button`, `Input`, `Alert`

### ディレクトリ構造

```
src/
├── components/
│   ├── ui/             # 基本UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Alert.tsx
│   ├── layout/         # レイアウト関連コンポーネント
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainContent.tsx
│   ├── theme/          # テーマ関連コンポーネント
│   │   ├── ThemeForm.tsx
│   │   └── ThemeTable.tsx
│   ├── siteConfig/     # サイト設定関連コンポーネント
│   │   └── SiteConfigForm.tsx
│   └── clustering/     # クラスタリング関連コンポーネント
│       └── HierarchicalClusterView.tsx
├── contexts/           # Reactコンテキスト
│   └── AuthContext.tsx
├── services/           # APIサービスなど
│   └── api/
│       ├── apiClient.ts
│       └── types.ts
├── pages/              # ページコンポーネント
│   ├── Dashboard.tsx
│   ├── ThemeList.tsx
│   ├── ThemeEdit.tsx
│   └── Login.tsx
└── utils/              # ユーティリティ関数
```

## フォントと色の管理

### フォント

- **基本フォント**: BIZ UDGothic
- **フォントウェイト**:
  - Regular (400): 通常のテキスト
  - Bold (700): 見出しや強調テキスト

### 色管理

管理画面ではshadcn/uiのvioletテーマを採用し、HSL変数とTailwindの設定で一元管理します：

```css
/* src/index.css */
:root {
  /* shadcn/ui テーマカラー */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 262.1 83.3% 57.8%; /* violet */
  --primary-foreground: 210 20% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%; /* 危険な操作を表す赤色 */
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 262.1 83.3% 57.8%;
  
  /* 追加の機能的な色 */
  --warning: 38 92% 50%; /* 警告を表す黄色 */
  --warning-foreground: 0 0% 0%;
  --success: 142 71% 45%; /* 成功を表す緑色 */
  --success-foreground: 0 0% 98%;
  --info: 221 83% 53%; /* 情報を表す青色 */
  --info-foreground: 0 0% 98%;
}
```

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
          dark: "hsl(var(--primary) / 0.9)", // 少し暗い色
          light: "hsl(var(--primary) / 0.8)", // 少し明るい色
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
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
      },
    },
  },
}
```

これにより、ハードコードされた色値（例: `bg-blue-600`）を意味のある名前（例: `bg-primary`）に置き換えることができます。

### 色の使用ガイドライン

- **テキスト**:
  - 本文: foreground (`text-foreground`)
  - 見出し: foreground (`text-foreground`)
  - リンク: primary (`text-primary`)
  - 補足テキスト: muted-foreground (`text-muted-foreground`)

- **背景**:
  - ページ背景: background (`bg-background`)
  - セクション背景: secondary (`bg-secondary`)
  - カード背景: card (`bg-card`)
  - 控えめな背景: muted (`bg-muted`)

- **アクセント**:
  - ボタン（プライマリ）: primary (`bg-primary text-primary-foreground`)
  - ボタン（セカンダリ）: secondary (`bg-secondary text-secondary-foreground`)
  - ボタン（デンジャー）: destructive (`bg-destructive text-destructive-foreground`)
  - ボタン（警告）: warning (`bg-warning text-warning-foreground`)
  - ボタン（成功）: success (`bg-success text-success-foreground`)
  - ボタン（情報）: info (`bg-info text-info-foreground`)

- **状態表示**:
  - 警告: warning (`bg-warning/20 text-warning-foreground`)
  - 成功: success (`bg-success/20 text-success-foreground`)
  - エラー: destructive (`bg-destructive/20 text-destructive-foreground`)
  - 情報: info (`bg-info/20 text-info-foreground`)

- **ボーダー**:
  - 通常のボーダー: border (`border-border`)
  - 入力フィールドのボーダー: input (`border-input`)
  - フォーカス時のリング: ring (`ring-ring`)

## レイアウトとスペーシング

### コンテナ

ページコンテンツは中央揃えのコンテナ内に配置します：

```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* コンテンツ */}
</div>
```

### スペーシング

一貫したスペーシングを使用するために、Tailwindのスペーシングスケールを活用します：

- **小さいスペース**: 4px (`p-1`, `m-1`)
- **標準スペース**: 16px (`p-4`, `m-4`)
- **大きいスペース**: 32px (`p-8`, `m-8`)
- **セクション間**: 24px (`mb-6`)

### レイアウトパターン

- **フレックスボックス**を使用して要素を水平・垂直に配置
  - `flex`: フレックスコンテナを作成
  - `flex-col`: 縦方向に配置
  - `flex-row`: 横方向に配置
  - `gap-{size}`: 要素間のスペース

- **パディング**と**マージン**を一貫して適用
  - `p-{size}`: パディング
  - `m-{size}`: マージン
  - `px-{size}`, `py-{size}`: 水平・垂直方向のパディング

## UIコンポーネント

### 基本コンポーネント

#### ボタン

shadcn/uiのButtonコンポーネントを使用し、様々なバリエーションを活用します：

- **バリアント**: default, destructive, outline, secondary, ghost, link
- **サイズ**: default, sm, lg, icon
- **状態**: 通常, disabled

```jsx
import { Button } from "@/components/ui/button";

// 使用例
<Button variant="default">ボタン</Button>
<Button variant="secondary">キャンセル</Button>
<Button variant="destructive" disabled={true}>削除</Button>
<Button variant="outline" size="sm">小さいボタン</Button>
<Button variant="ghost" size="icon"><IconName /></Button>
```

#### 入力フィールド

shadcn/uiのInputコンポーネントを使用してフォーム入力を処理します：

```jsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 使用例
<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="title">タイトル</Label>
  <Input
    id="title"
    name="title"
    value={title}
    onChange={handleChange}
    required={true}
  />
  {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
</div>
```

#### アラート

shadcn/uiのAlertコンポーネントを使用して、様々なタイプのメッセージを表示します：

```jsx
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { InfoIcon, AlertTriangleIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react";

// 使用例
<Alert variant="default">
  <InfoIcon className="h-4 w-4" />
  <AlertTitle>情報</AlertTitle>
  <AlertDescription>情報メッセージ</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertCircleIcon className="h-4 w-4" />
  <AlertTitle>エラー</AlertTitle>
  <AlertDescription>エラーが発生しました</AlertDescription>
</Alert>
```

### レイアウトコンポーネント

#### ヘッダー

```jsx
import Header from "../components/layout/Header";

// 使用例
<Header />
```

#### サイドバー

```jsx
import Sidebar from "../components/layout/Sidebar";

// 使用例
<Sidebar />
```

#### メインコンテンツ

```jsx
import MainContent from "../components/layout/MainContent";

// 使用例
<MainContent>
  {/* ページコンテンツ */}
</MainContent>
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

- **PC操作を優先**したアプローチを採用
- 基本スタイルはデスクトップ向けに設定し、必要に応じて小さな画面サイズに対応
- レスポンシブクラスの命名規則:
  - デフォルト: デスクトップ画面向けに適用（例: `grid-cols-3`）
  - ブレイクポイント接頭辞: 特定の画面サイズ以下に適用（例: `sm:grid-cols-1`）

## アクセシビリティ

管理画面においても、アクセシビリティに配慮したデザインと実装を心がけます。適切なコントラスト比、キーボード操作のサポート、スクリーンリーダー対応などを考慮してください。

## ベストプラクティス

このガイドラインは、いどばた管理画面の一貫性と品質を確保するための基盤となります。プロジェクトの成長に合わせて継続的に更新し、チーム全体で共有することで、効率的な開発と高品質なユーザー体験を実現します。
