# Tailwind CSS 修正タスクリスト

以下は、Tailwind CSS の問題を修正するための 3 段階のタスクリストです：

## 1. 設定ファイルの修正

- [ ] **PostCSS の設定を修正**
  - [ ] `frontend/postcss.config.js` の `'@tailwindcss/postcss'` を `'tailwindcss'` に変更

- [ ] **CSS インポートの更新**
  - [ ] `frontend/src/index.css` の先頭部分を修正
  - [ ] `@import "tailwindcss/preflight"` を `@tailwind base` に変更
  - [ ] `@tailwind components` ディレクティブを追加

- [ ] **Vite の設定を修正**
  - [ ] `frontend/vite.config.ts` から `@tailwindcss/vite` のインポートを削除
  - [ ] `tailwindcss()` プラグインの使用を削除

## 2. パッケージの依存関係の更新

- [ ] **不要なパッケージを削除**
  - [ ] `@tailwindcss/vite` パッケージを削除
  - [ ] `@tailwindcss/postcss` パッケージを削除

- [ ] **パッケージの再インストール**
  - [ ] `npm install` を実行して依存関係を更新

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

### 2. CSS インポートの更新

**現在の問題点**: 非標準の `@import "tailwindcss/preflight"` を使用し、`@tailwind components` が不足している

**ファイル**: `frontend/src/index.css`

**変更前**:
```css
@import "tailwindcss/preflight";
@tailwind utilities;
```

**変更後**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

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
