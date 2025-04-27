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
const handleClick = e => {
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
import Component from './Component'; // 拡張子を省略
```

### 6. main.jsxの更新

`main.jsx`を`main.tsx`に変更した後、`App.jsx`のインポートを更新します：

```typescript
// 変換前
import { router } from './App.jsx';

// 変換後
import { router } from './App';
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
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // TypeScript関連のルールを一時的に緩和
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
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

### 3. ファイル拡張子の変更 (2025/4/27)

以下のファイルの拡張子を`.jsx`から`.tsx`に変更しました：

1. `src/App.jsx` → `src/App.tsx`（すでに変更済みでした）
2. `src/main.jsx` → `src/main.tsx`
3. `src/components/AdminPanel.jsx` → `src/components/AdminPanel.tsx`
4. `src/components/AppLayout.jsx` → `src/components/AppLayout.tsx`
5. `src/components/ChatHistory.jsx` → `src/components/ChatHistory.tsx`
6. `src/components/ChatInput.jsx` → `src/components/ChatInput.tsx`
7. `src/components/DataList.jsx` → `src/components/DataList.tsx`
8. `src/components/Notification.jsx` → `src/components/Notification.tsx`
9. `src/components/ThreadExtractions.jsx` → `src/components/ThreadExtractions.tsx`
10. `src/components/VisualizationArea.jsx` → `src/components/VisualizationArea.tsx`
11. `src/pages/DataPage.jsx` → `src/pages/DataPage.tsx`
12. `src/pages/MainPage.jsx` → `src/pages/MainPage.tsx`

また、`main.tsx`のインポート文を更新しました：

```typescript
// 変更前
import { router } from './App.jsx';

// 変更後
import { router } from './App';
```

他のファイルのインポート文は拡張子が含まれていなかったため、更新は不要でした。

#### ファイル拡張子の変更結果

- すべてのファイルの拡張子を`.jsx`から`.tsx`に変更することができました
- `main.tsx`のインポート文を更新しました
- TypeScriptのエラーが発生していますが、これは作業4「最小限の型定義の追加」で対応する予定です

### 4. 最小限の型定義の追加 (2025/4/27)

まず、tsconfig.jsonを更新して型チェックを緩和しました：

```json
{
  "compilerOptions": {
    // 既存の設定...

    /* Linting */
    "strict": false,
    "noImplicitAny": false,
    "strictNullChecks": false
    // その他の設定...
  }
}
```

次に、以下のファイルに最小限の型定義を追加しました：

1. `src/App.tsx`

   - `useState<string | null>`の型パラメータを追加

2. `src/main.tsx`

   - `document.getElementById('root')`の戻り値に対するnullチェックを追加

3. `src/components/AppLayout.tsx`

   - `OutletContext`インターフェースを定義
   - 状態変数に型パラメータを追加（`useState<Message[]>`, `useState<string | null>`など）
   - 関数に戻り値の型を追加（`async (): Promise<void>`）
   - エラー処理に`any`型を使用

4. `src/components/ChatInput.tsx`

   - `ChatInputProps`インターフェースを定義
   - イベントハンドラに型を追加（`React.FormEvent`, `React.ChangeEvent<HTMLTextAreaElement>`など）

5. `src/components/ChatHistory.tsx`

   - `Message`インターフェースを定義
   - `ChatHistoryProps`インターフェースを定義
   - `useRef<HTMLDivElement>(null)`の型パラメータを追加

6. `src/components/ThreadExtractions.tsx`

   - `Problem`と`Solution`インターフェースを定義
   - `ThreadExtractionsProps`インターフェースを定義
   - 状態変数に型パラメータを追加

7. `src/components/Notification.tsx`

   - `NotificationProps`インターフェースを定義
   - 状態変数に型パラメータを追加

8. `src/components/DataList.tsx`

   - データ型のインターフェースを定義（`Problem`, `Solution`, `Question`, `PolicyDraft`）
   - 状態変数に型パラメータを追加
   - 関数に戻り値の型を追加

9. `src/components/VisualizationArea.tsx`
   - データ型のインターフェースを定義（`Question`, `QuestionDetails`, `PolicyDraft`, `DigestDraft`など）
   - 状態変数に型パラメータを追加
   - 関数に戻り値の型を追加

#### 最小限の型定義の追加結果

- 各コンポーネントに最小限の型定義を追加することができました
- 必要に応じて`any`型を使用して、複雑な型の定義を回避しました
- 型定義の追加により、コードの可読性と保守性が向上しました
- 将来的には、より具体的な型に置き換えていくことが望ましいです

### 型定義の集約 (2025/4/27)

作業4の実施後、各コンポーネントファイル内で個別に定義されていたドメインオブジェクトのインターフェースを`types.ts`に集約しました。

#### 変更内容

1. `types.ts`に以下のドメインオブジェクトのインターフェースを集約

   - `Problem`
   - `Solution`
   - `Question`
   - `PolicyDraft`
   - `DigestDraft`
   - `RelatedProblem`
   - `RelatedSolution`
   - `QuestionDetails`
   - `TabType`

2. 各コンポーネントファイルを更新して、`types.ts`からインターフェースをインポートするように変更
   - `DataList.tsx`
   - `VisualizationArea.tsx`

#### 型定義の集約結果

- ドメインオブジェクトのインターフェースを一箇所で管理することで、型の一貫性が保たれるようになりました
- プロトタイピング段階でデータ構造が変更された場合、一箇所を修正するだけで済むようになりました
- DRY原則に従い、同じインターフェースを複数の場所で定義することを避けられるようになりました
- 将来的な拡張や変更に対して、より柔軟に対応できるようになりました

#### 追加の修正 (2025/4/27)

さらに、以下のファイルも修正して、共通ドメインオブジェクトのインターフェースを`types.ts`からインポートするようにしました：

1. `frontend/src/components/ThreadExtractions.tsx`

   - `Problem`と`Solution`のインターフェースを`types.ts`からインポート

2. `frontend/src/components/AppLayout.tsx`

   - `OutletContext`, `Message`, `Problem`, `Solution`, `NotificationType`, `PreviousExtractions`のインターフェースを`types.ts`からインポート

3. `frontend/src/components/ChatHistory.tsx`
   - `Message`インターフェースを`types.ts`からインポート

また、`types.ts`の`Message`インターフェースも更新して、`timestamp`の型を`Date`から`string | Date`に変更しました。これにより、すべてのコンポーネントで一貫した型定義を使用できるようになりました。

### Prettier と ESLint の設定 (2025/4/27)

コードの品質と一貫性を確保するために、Prettier と ESLint を設定し、保存時に自動フォーマットされるようにしました。

#### 実施内容

1. 必要なパッケージのインストール

   ```bash
   npm install --save-dev prettier eslint-config-prettier
   ```

2. Prettier の設定ファイル (.prettierrc) の作成

   ```json
   {
     "semi": true,
     "singleQuote": true,
     "tabWidth": 2,
     "trailingComma": "es5",
     "printWidth": 100,
     "bracketSpacing": true,
     "arrowParens": "avoid"
   }
   ```

3. ESLint の設定ファイル (eslint.config.js) の更新

   - TypeScript ESLint の設定を追加
   - Prettier との競合を避けるための設定を追加
   - TypeScript 関連のルールを一時的に緩和

4. VSCode の設定ファイル (.vscode/settings.json) の作成

   - 保存時に自動フォーマットするように設定
   - ESLint の自動修正を有効化

5. package.json にフォーマットコマンドを追加
   ```json
   "scripts": {
     "lint:fix": "eslint . --fix",
     "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css}\""
   }
   ```

#### 設定結果

- 保存時に自動的にコードがフォーマットされるようになりました
- ESLint によるコード品質のチェックが行われるようになりました
- 未使用のインポートが自動的に削除されるようになりました
- コマンドラインからも簡単にフォーマットできるようになりました
  - `npm run format` でコードをフォーマット
  - `npm run lint:fix` で ESLint の自動修正を実行

#### 追加設定: 未使用インポートの自動削除

フォーマット時に未使用のインポートを自動的に削除するために、以下の設定を追加しました：

1. eslint-plugin-unused-imports のインストール

   ```bash
   npm install --save-dev eslint-plugin-unused-imports
   ```

2. ESLint の設定ファイルに未使用インポート削除のルールを追加

   ```javascript
   // eslint.config.js
   import unusedImports from 'eslint-plugin-unused-imports';

   export default [
     // 他の設定...
     unusedImports.configs.recommended,
     {
       rules: {
         // 未使用のインポートを自動的に削除
         'unused-imports/no-unused-imports': 'error',
         'unused-imports/no-unused-vars': [
           'warn',
           { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
         ],
         // その他のルール...
       },
     },
   ];
   ```

これにより、保存時やフォーマット実行時に未使用のインポートが自動的に削除されるようになり、コードの整理が容易になりました。

### JavaScriptの名残ファイルの削除 (2025/4/27)

TypeScript専用のプロジェクトにするため、JavaScriptと併存させていた名残のファイルを確認し、不要なファイルを削除しました。

#### 実施内容

1. `vite.config.js`の削除

   - `vite.config.ts`が既に存在しており、内容もほぼ同じだったため、JavaScriptバージョンを削除しました。

2. 設定ファイルの確認
   - `tailwind.config.js`と`eslint.config.js`は設定ファイルとして一般的にJavaScriptで記述されることが多いため、そのままにしました。

#### 結果

- 不要なJavaScriptファイルを削除し、TypeScript専用のプロジェクト構成になりました。
- 設定ファイルなど、JavaScriptが適切な場合はそのままにしています。
- すべてのコンポーネントファイルは`.tsx`拡張子になっており、一貫性のある構成になりました。
