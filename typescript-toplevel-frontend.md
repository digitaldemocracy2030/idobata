# TypeScript移行計画: フロントエンド

## 概要

このドキュメントでは、現在JavaScriptで書かれているフロントエンドコードをTypeScriptに移行するための手順を説明します。この移行計画では、まずはファイル拡張子を`.jsx`から`.tsx`に変更し、最小限の型定義を追加することに焦点を当てます。厳密な型安全性は後のフェーズで対応するため、必要に応じて`any`型を使用します。

## 作業時の注意
- ユーザーからの指示への返答はかならず日本語で行ってください。
- 基本的にコマンドの標準出力は取得できないので、commandResult.txt ファイルにパイプで出力してその結果をファイルから読み取ってください。
- コマンドの結果が不明です、という状態で次の作業に進まないでください。
- 必要になるまでファイルは実装しないでください。空の ts ファイルなどは作らないでください。
- コメントや Doc は記載しないでコードのみを記載してください。
- その時点では必要のない網羅性のためのメソッドは実装せず、その作業時点で明らかに必要なメソッドのみを実装する方針としてください。
- 仕様が変わりやすいプロトタイピングなので、unittest は最小限にしたいです。指示されるまでテストは記載しないでください。

## 前提条件

- TypeScriptの基本的な設定はすでに完了しています（tsconfig.json、tsconfig.node.jsonが存在）
- 必要なTypeScript関連のパッケージはすでにインストールされています
- ビルドスクリプトにはすでにTypeScriptのコンパイルステップが含まれています

## 移行手順

### 1. 現状の確認

- 現在のTypeScript設定を確認
- 移行が必要なJavaScriptファイルのリストを作成

### 2. TypeScript設定の調整

`tsconfig.json`に以下の設定が含まれていることを確認します：

```json
{
  "compilerOptions": {
    // 既存の設定...

    // JSXファイルをTSXに変換するための設定
    "allowJs": true,
    "checkJs": false,

    // 厳密な型チェックを一時的に緩和
    "noImplicitAny": false,
    "strictNullChecks": false
  }
}
```

### 3. ファイル拡張子の変更

以下のファイルの拡張子を`.jsx`から`.tsx`に変更します：

- `src/App.jsx` → `src/App.tsx`
- `src/main.jsx` → `src/main.tsx`
- `src/components/AdminPanel.jsx` → `src/components/AdminPanel.tsx`
- `src/components/AppLayout.jsx` → `src/components/AppLayout.tsx`
- `src/components/ChatHistory.jsx` → `src/components/ChatHistory.tsx`
- `src/components/ChatInput.jsx` → `src/components/ChatInput.tsx`
- `src/components/DataList.jsx` → `src/components/DataList.tsx`
- `src/components/Notification.jsx` → `src/components/Notification.tsx`
- `src/components/ThreadExtractions.jsx` → `src/components/ThreadExtractions.tsx`
- `src/components/VisualizationArea.jsx` → `src/components/VisualizationArea.tsx`
- `src/pages/DataPage.jsx` → `src/pages/DataPage.tsx`
- `src/pages/MainPage.jsx` → `src/pages/MainPage.tsx`

### 4. 最小限の型定義の追加

各ファイルに最小限の型定義を追加します。以下のパターンに従って変換します：
自明なときはanyではなく型を記載しますが、解決が難しい際はanyを利用してもよいこととします。

#### Reactコンポーネントの型定義

```typescript
// 変換前
function Component(props) {
  // ...
}

// 変換後
function Component(props: any) {
  // ...
}

// または
interface ComponentProps {
  // 必要に応じてプロパティを追加
  [key: string]: any;
}

function Component(props: ComponentProps) {
  // ...
}
```

#### useState/useEffectの型定義


```typescript
// 変換前
const [state, setState] = useState(initialValue);

// 変換後
const [state, setState] = useState<any>(initialValue);
```

#### イベントハンドラの型定義

```typescript
// 変換前
const handleClick = (e) => {
  // ...
};

// 変換後
const handleClick = (e: React.MouseEvent<HTMLElement>) => {
  // ...
};

// または
const handleChange = (e: any) => {
  // ...
};
```

### 5. インポート参照の更新

ファイル拡張子を変更した後、インポート文も更新する必要があります：

```typescript
// 変換前
import Component from './Component.jsx';

// 変換後
import Component from './Component';  // 拡張子を省略
```

### 6. main.jsxの更新

`main.jsx`を`main.tsx`に変更した後、`App.jsx`のインポートを更新します：

```typescript
// 変換前
import { router } from './App.jsx'

// 変換後
import { router } from './App'
```

### 7. テストとデバッグ

各ファイルを変換した後、以下のコマンドでアプリケーションをビルドしてテストします：

```bash
npm run build
npm run dev
```

TypeScriptのコンパイルエラーが発生した場合は、必要に応じて`any`型を使用して一時的に解決します。

### 8. ESLint設定の更新

ESLintの設定を更新して、TypeScriptファイルをサポートするようにします：

```javascript
// eslint.config.js
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat();

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends('plugin:react-hooks/recommended'),
  ...compat.extends('plugin:react-refresh/recommended'),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      // TypeScript関連のルールを一時的に緩和
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  }
];
```

## 移行の実行手順

1. 開発ブランチを作成する
   ```bash
   git checkout -b typescript-migration
   ```

2. TypeScript設定を調整する
   - `tsconfig.json`を更新

3. 各ファイルを順番に変換する
   - ファイル拡張子を`.jsx`から`.tsx`に変更
   - 最小限の型定義を追加
   - インポート参照を更新

4. ESLint設定を更新する

5. アプリケーションをビルドしてテストする
   ```bash
   npm run build
   npm run dev
   ```

6. 問題があれば修正する

7. 変更をコミットする
   ```bash
   git add .
   git commit -m "Convert frontend to TypeScript"
   ```

## 将来の改善点

この初期移行後、以下の改善を段階的に行うことができます：

1. 残った`any`型を具体的な型に置き換える
2. 厳密な型チェックを有効にする（`noImplicitAny: true`など）
3. コンポーネントのpropsとstateに適切なインターフェースを定義する
4. APIレスポンスの型定義を追加する
5. ユーティリティ関数に型定義を追加する

## 注意点

- この移行計画では、まずはTypeScriptへの移行を完了させることを優先し、厳密な型チェックは後のフェーズで対応します
- `any`型を使用することで、TypeScriptの型チェックの恩恵を一部失いますが、段階的な移行を可能にします
- 将来的には、`any`型を具体的な型に置き換えていくことをお勧めします

## 作業ログ

### 1. 現状の確認 (2025/4/27)

#### 現在のTypeScript設定

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Allow JS files */
    "allowJs": true,
    "checkJs": false
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**tsconfig.node.json**
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

#### 移行が必要なJavaScriptファイル

以下のファイルを`.jsx`から`.tsx`に変換する必要があります：

1. `src/App.jsx`
2. `src/main.jsx`
3. `src/components/AdminPanel.jsx`
4. `src/components/AppLayout.jsx`
5. `src/components/ChatHistory.jsx`
6. `src/components/ChatInput.jsx`
7. `src/components/DataList.jsx`
8. `src/components/Notification.jsx`
9. `src/components/ThreadExtractions.jsx`
10. `src/components/VisualizationArea.jsx`
11. `src/pages/DataPage.jsx`
12. `src/pages/MainPage.jsx`

#### 現状の確認結果

- TypeScriptの基本設定は既に完了しています（tsconfig.json、tsconfig.node.jsonが存在）
- `allowJs: true`と`checkJs: false`の設定が既に含まれています
- 現在は`strict: true`が設定されていますが、移行中は一時的に緩和する必要があるかもしれません
- 移行が必要なJavaScriptファイルは12個あります

### 2. TypeScript設定の調整 (2025/4/27)

現在のtsconfig.jsonファイルには、以下の変更が必要です：

1. `strict: true`を`strict: false`に変更
2. `noImplicitAny: false`を追加
3. `strictNullChecks: false`を追加

**変更後のtsconfig.json（推奨設定）**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": false,
    "noImplicitAny": false,
    "strictNullChecks": false,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Allow JS files */
    "allowJs": true,
    "checkJs": false
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### TypeScript設定の調整結果

- Architect モードでは直接 tsconfig.json ファイルを編集できないため、必要な変更点を記録しました
- 次のステップでは、Code モードに切り替えて実際に tsconfig.json ファイルを更新する必要があります
- 主な変更点は、型チェックを緩和するための設定（`strict: false`, `noImplicitAny: false`, `strictNullChecks: false`）の追加です
