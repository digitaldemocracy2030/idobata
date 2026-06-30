# いどばた管理画面の色管理実装計画

## 目次

1. [現状の課題](#現状の課題)
2. [実装目標](#実装目標)
3. [実装手順](#実装手順)
   - [Step 1: CSS変数の定義](#step-1-css変数の定義)
   - [Step 2: Tailwind設定の更新](#step-2-tailwind設定の更新)
   - [Step 3: コンポーネントの更新](#step-3-コンポーネントの更新)
   - [Step 4: デザインガイドラインの更新](#step-4-デザインガイドラインの更新)
4. [テスト計画](#テスト計画)

## 現状の課題

現在のいどばた管理画面の色管理には以下の課題があります：

1. **デザインガイドラインと実装の不一致**：デザインガイドラインではshadcn/uiのvioletテーマを使用することが推奨されていますが、実際の実装ではハードコードされた色値が使用されています。

2. **色の定義が統一されていない**：tailwind.config.jsでは直接色コードが指定されており、shadcn/uiのHSL変数を使用していません。

3. **機能的な色（警告、エラーなど）の管理が不十分**：危険な操作を表す色などが統一的に管理されていません。

4. **コンポーネント内でのハードコードされた色の使用**：Buttonコンポーネントなどで直接色名（bg-blue-600など）が使用されています。

## 実装目標

1. shadcn/uiのHSL変数を使用した統一的な色管理システムを実装する
2. メインカラー（violet）だけでなく、機能的な色（警告、エラー、成功など）も統一的に管理する
3. 既存のコンポーネントを新しい色管理システムに移行する
4. デザインガイドラインを実装に合わせて更新する

## 実装手順

### Step 1: CSS変数の定義

`src/index.css`ファイルにshadcn/uiのHSL変数を定義します。フロントエンドの実装を参考に、以下のように実装します：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
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
}
```

### Step 2: Tailwind設定の更新

`tailwind.config.js`ファイルを更新して、shadcn/uiのHSL変数を使用するように設定します：

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
        // 追加の機能的な色
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
  plugins: [],
};
```

### Step 3: コンポーネントの更新

既存のUIコンポーネントを更新して、新しい色変数を使用するようにします。例えば、Buttonコンポーネントは以下のように更新します：

```tsx
import React from "react";
import type { FC, ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "warning" | "success" | "info";
}

const Button: FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
}) => {
  const baseStyles = "px-4 py-2 rounded font-medium focus:outline-none";

  const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50",
    warning: "bg-warning text-warning-foreground hover:bg-warning/90 disabled:opacity-50",
    success: "bg-success text-success-foreground hover:bg-success/90 disabled:opacity-50",
    info: "bg-info text-info-foreground hover:bg-info/90 disabled:opacity-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]}`}
    >
      {children}
    </button>
  );
};

export default Button;
```

同様に、他のコンポーネント（Input.tsx、Alert.tsxなど）も更新して、新しい色変数を使用するようにします。

### Step 4: デザインガイドラインの更新

デザインガイドライン（`admin/project/design-guidelines.md`）を更新して、実際の実装と一致させます。特に「フォントと色の管理」セクションを以下のように更新します：

```markdown
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
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // 他の色も同様に定義...
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

- **背景**:
  - ページ背景: background (`bg-background`)
  - セクション背景: secondary (`bg-secondary`)
  - カード背景: card (`bg-card`)

- **アクセント**:
  - ボタン（プライマリ）: primary (`bg-primary`)
  - ボタン（セカンダリ）: secondary (`bg-secondary`)
  - ボタン（デンジャー）: destructive (`bg-destructive`)
  - 警告: warning (`bg-warning`)
  - 成功: success (`bg-success`)
  - エラー: destructive (`bg-destructive`)
  - 情報: info (`bg-info`)
```

## テスト計画

実装後、以下の項目をテストして色管理が正しく機能していることを確認します：

1. **視覚的一貫性のチェック**：
   - すべてのUIコンポーネントが新しい色変数を使用していることを確認
   - プライマリカラー（violet）が一貫して適用されていることを確認
   - 機能的な色（警告、エラー、成功など）が適切に表示されることを確認

2. **レスポンシブデザインのチェック**：
   - 異なる画面サイズでの色の表示を確認
   - モバイル、タブレット、デスクトップでの見た目を確認

3. **アクセシビリティのチェック**：
   - コントラスト比がWCAGガイドラインに準拠していることを確認
   - 色だけに依存しない情報伝達を確認
