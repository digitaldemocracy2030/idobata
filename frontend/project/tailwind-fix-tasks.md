# Tailwind CSS 修正タスクリスト

以下は、Tailwind CSS の問題を修正するための 3 段階のタスクリストです：

## 作業時の注意事項

- 各作業は順番に実施し、一つの作業が完了してから次の作業に進む
- 作業完了後は作業ログに記録する
- 実装中に問題が発生した場合は、作業ログに記録する
- 設計と実装に差異がある場合は、設計を修正する

## 作業ログ

### 2025/4/27 午前9:42
- 作業1「設定ファイルの修正」を完了
  - PostCSS設定を修正: `'@tailwindcss/postcss'` を `'tailwindcss'` に変更
  - CSS設定を確認: プロジェクトはTailwind CSS v4を使用しており、既に正しいディレクティブを使用していることを確認
  - Vite設定を修正: `@tailwindcss/vite` のインポートと使用を削除
- 発見事項: プロジェクトはTailwind CSS v4を使用しているため、当初の想定と異なるディレクティブが必要でした。タスクリストを更新して正しい情報を反映しました。

### 2025/4/27 午前9:44
- 作業2「パッケージの依存関係の更新」を完了
  - package.jsonから不要なパッケージを削除: `@tailwindcss/vite` と `@tailwindcss/postcss`
  - npmコマンドを実行: `npm uninstall @tailwindcss/vite @tailwindcss/postcss && npm install`

## 1. 設定ファイルの修正

- [x] **PostCSS の設定を修正**
  - [x] `frontend/postcss.config.js` の `'@tailwindcss/postcss'` を `'tailwindcss'` に変更

- [x] **CSS インポートの確認**
  - [x] `frontend/src/index.css` の先頭部分を確認
  - [x] **注意**: プロジェクトはTailwind CSS v4を使用しているため、v4の正しいディレクティブを使用する必要があります
  - [x] v4では `@import "tailwindcss/preflight"` と `@tailwind utilities` が正しい使い方です

- [x] **Vite の設定を修正**
  - [x] `frontend/vite.config.ts` から `@tailwindcss/vite` のインポートを削除
  - [x] `tailwindcss()` プラグインの使用を削除

## 2. パッケージの依存関係の更新

- [x] **不要なパッケージを削除**
  - [x] `@tailwindcss/vite` パッケージを削除
  - [x] `@tailwindcss/postcss` パッケージを削除

- [x] **パッケージの再インストール**
  - [x] `npm install` を実行して依存関係を更新

## 3. 変更の適用と確認

- [ ] **開発サーバーの再起動**
  - [ ] `npm run dev` を実行

- [ ] **Tailwind CSS の動作確認**
  - [ ] ブラウザで表示を確認
  - [ ] Tailwind のクラスが正しく適用されているか確認

## 修正内容の詳細

### 1. PostCSS 設定の修正

**現在の問題点**: 非標準のプラグイン名 `'@tailwindcss/postcss'` を使用している

**ファイル**: `frontend/postcss.config.js`

**変更前**:
```javascript
// postcss.config.js
export default {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  }
```

**変更後**:
```javascript
// postcss.config.js
export default {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  }
```

### 2. CSS インポートの確認

**現在の状況**: プロジェクトはTailwind CSS v4を使用しており、v4の正しいディレクティブを既に使用している

**ファイル**: `frontend/src/index.css`

**現在の実装（正しい）**:
```css
@import "tailwindcss/preflight";
@tailwind utilities;
```

**注意**: Tailwind CSS v4では、`@tailwind base` と `@tailwind components` は廃止され、代わりに `@import "tailwindcss/preflight"` と `@tailwind utilities` を使用します。

### 3. Vite 設定の修正

**現在の問題点**: 非標準の `@tailwindcss/vite` プラグインを使用している

**ファイル**: `frontend/vite.config.ts`

**変更前**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
})
```

**変更後**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
})
```

### 4. パッケージ依存関係の更新

**現在の問題点**: 非標準の Tailwind パッケージを使用している

**ファイル**: `frontend/package.json`

**削除するべき依存関係**:
- `"@tailwindcss/vite": "^4.1.3"` (dependencies から)
- `"@tailwindcss/postcss": "^4.1.4"` (devDependencies から)

**ファイル変更後に実行するコマンド**:
```bash
cd frontend
npm uninstall @tailwindcss/vite @tailwindcss/postcss
npm install
