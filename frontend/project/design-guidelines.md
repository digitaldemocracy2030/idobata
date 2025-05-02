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

### コンポーネント設計原則

1. **単一責任の原則**
   - 各コンポーネントは1つの責任のみを持つ
   - 複雑なコンポーネントは小さなコンポーネントに分割する

2. **コンポジション優先**
   - 継承よりもコンポジションを優先する
   - 小さなコンポーネントを組み合わせて複雑なUIを構築する

3. **プロップドリリングの回避**
   - 深い階層へのプロップ伝達は避ける
   - コンテキストやカスタムフックを適切に活用する

4. **再利用性の向上**
   - 汎用的なコンポーネントは再利用しやすいように設計する
   - ビジネスロジックとUIを分離する

## フォントと色の管理

### フォント

- **基本フォント**: BIZ UDGothic
- **フォントウェイト**:
  - Regular (400): 通常のテキスト
  - Bold (700): 見出しや強調テキスト

```css
/* Tailwindでの設定例 */
fontFamily: {
  sans: [
    '"BIZ UDGothic"',
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
  biz: ['"BIZ UDGothic"', "sans-serif"],
}
```

### 色管理の改善案

現状では直接カラーコードを使用している箇所がありますが、以下のようにTailwindの設定で一元管理することを推奨します：

```js
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      // ブランドカラー
      primary: {
        light: '#EADFFF', // 薄い紫（セクション背景）
        DEFAULT: '#6B46C1', // 標準の紫
        dark: '#553C9A', // 濃い紫
      },
      // ニュートラルカラー
      neutral: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },
      // 機能カラー
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
}
```

これにより、ハードコードされた色値（例: `bg-[#EADFFF]`）を意味のある名前（例: `bg-primary-light`）に置き換えることができます。

### 色の使用ガイドライン

- **テキスト**:
  - 本文: neutral-600 (`text-neutral-600`)
  - 見出し: neutral-900 (`text-neutral-900`)
  - リンク: primary (`text-primary`)

- **背景**:
  - ページ背景: white (`bg-white`)
  - セクション背景: primary-light (`bg-primary-light`)
  - カード背景: white (`bg-white`)

- **アクセント**:
  - ボタン: primary (`bg-primary`)
  - ハイライト: primary-light (`bg-primary-light`)

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
- **グリッド**を使用して複雑なレイアウトを構築
- **パディング**と**マージン**を一貫して適用

```jsx
// フレックスボックスの例
<div className="flex flex-col gap-4">
  <div>アイテム1</div>
  <div>アイテム2</div>
</div>

// グリッドの例
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>アイテム1</div>
  <div>アイテム2</div>
  <div>アイテム3</div>
</div>
```

## UIコンポーネント

### 基本コンポーネント

以下の基本コンポーネントを作成し、アプリケーション全体で再利用することを推奨します：

#### ボタン

```jsx
// components/common/Button/Button.tsx
import { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "text";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
}: ButtonProps) => {
  const baseClasses = "rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary",
    secondary: "bg-neutral-200 text-neutral-800 hover:bg-neutral-300 focus:ring-neutral-300",
    outline: "border border-primary text-primary hover:bg-primary-light focus:ring-primary",
    text: "text-primary hover:bg-primary-light focus:ring-primary",
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
```

#### カード

```jsx
// components/common/Card/Card.tsx
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
```

### セクションコンポーネント

セクションコンポーネントは一貫したスタイルで作成します：

```jsx
// components/home/Section.tsx
import { ReactNode } from "react";
import SectionTitle from "./SectionTitle";

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

const Section = ({
  title,
  description,
  children,
  className = "",
}: SectionProps) => {
  return (
    <section className={`bg-primary-light rounded-3xl px-4 py-8 ${className}`}>
      <SectionTitle title={title} />
      {description && (
        <p className="text-xs text-neutral-600 mb-3">{description}</p>
      )}
      {children}
    </section>
  );
};

export default Section;
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

```jsx
// モバイルファーストの例
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* コンテンツ */}
</div>
```

## アクセシビリティ

### 基本原則

- **セマンティックHTML**を使用する
- 適切な**ARIA属性**を提供する
- **キーボードナビゲーション**をサポートする
- 十分な**コントラスト比**を確保する

### チェックリスト

- 画像には適切な`alt`テキストを提供する
- フォームコントロールには関連する`label`を使用する
- インタラクティブ要素は適切なフォーカススタイルを持つ
- 色だけに依存した情報伝達を避ける

## ベストプラクティス

### Reactのベストプラクティス

1. **コンポーネントの分割**
   - 大きなコンポーネントは小さく分割する
   - 再利用可能なコンポーネントを作成する

2. **状態管理**
   - ローカル状態には`useState`を使用
   - 複雑な状態管理には`useReducer`を検討
   - グローバル状態にはコンテキストを活用

3. **副作用の管理**
   - 副作用は`useEffect`内に限定する
   - 依存配列を適切に設定する
   - クリーンアップ関数を提供する

4. **パフォーマンス最適化**
   - `React.memo`で不要な再レンダリングを防ぐ
   - `useCallback`と`useMemo`を適切に使用する
   - 大きなリストには仮想化を検討する

### Tailwind CSSのベストプラクティス

1. **クラスの整理**
   - 関連するクラスをグループ化する
   - 長いクラスリストは抽出を検討する

2. **カスタム設定の活用**
   - プロジェクト固有の設定は`tailwind.config.js`で定義
   - 繰り返し使用するスタイルはコンポーネントとして抽出

3. **@applyディレクティブの使用**
   - 複雑なスタイルの組み合わせは`@apply`で抽出
   - ただし過度な使用は避ける

4. **ユーティリティの拡張**
   - 必要に応じてカスタムユーティリティを作成
   - プラグインを活用して機能を拡張

### コード品質

1. **一貫性のある命名規則**
   - コンポーネント: PascalCase
   - 関数とカスタムフック: camelCase
   - ファイル: コンポーネントと同じ名前

2. **型の適切な使用**
   - インターフェースとタイプを明示的に定義
   - `any`型の使用を避ける
   - ジェネリック型を活用する

3. **コメントとドキュメント**
   - 複雑なロジックには説明コメントを追加
   - コンポーネントのプロップには適切な説明を提供

4. **テスト**
   - ユニットテストでコンポーネントの動作を検証
   - インテグレーションテストで複雑な相互作用をテスト
   - スナップショットテストでUIの変更を追跡

---

このガイドラインは、いどばたフロントエンドの一貫性と品質を確保するための基盤となります。プロジェクトの成長に合わせて継続的に更新し、チーム全体で共有することで、効率的な開発と高品質なユーザー体験を実現します。
