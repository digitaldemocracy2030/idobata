# いどばたビジョンバックエンド TypeScript 移行計画

## 概要

このドキュメントでは、いどばたビジョン（idea-discussion）のバックエンドを JavaScript から TypeScript に段階的に移行するための計画を概説します。型安全性を高めることで、コードの品質向上、バグの早期発見、開発効率の向上を目指します。

## 移行の目的

- **型安全性の向上**: 実行時エラーを減らし、コードの信頼性を高める
- **開発体験の向上**: IDE のコード補完や型チェックによる開発効率の向上
- **ドキュメンテーションの改善**: 型定義によるコードの自己文書化
- **保守性の向上**: リファクタリングやコード変更時の安全性確保
- **policy-edit バックエンドとの一貫性**: すでに TypeScript を使用している policy-edit バックエンドとの技術的一貫性

## 段階的移行アプローチ

TypeScript への移行は、一度にすべてのコードを変換するのではなく、段階的に行います。これにより、リスクを最小限に抑えながら、継続的に機能を提供し続けることができます。

### フェーズ 1: 環境セットアップと基本設定

1. **TypeScript と関連パッケージのインストール**:
   ```bash
   npm install --save-dev typescript @types/node @types/express @types/cors @types/mongoose @types/bcryptjs @types/jsonwebtoken ts-node nodemon
   ```

2. **tsconfig.json の作成**:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "Node16",
       "moduleResolution": "Node16",
       "outDir": "./build",
       "rootDir": ".",
       "strict": false,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true,
       "allowJs": true,
       "checkJs": false
     },
     "include": ["**/*"],
     "exclude": ["node_modules"]
   }
   ```

3. **package.json スクリプトの更新**:
   ```json
   "scripts": {
     "build": "tsc",
     "start": "node build/server.js",
     "dev": "nodemon --exec ts-node server.js",
     "typecheck": "tsc --noEmit"
   }
   ```

4. **ESLint の TypeScript サポート追加** (既存の Biome 設定を拡張)

### フェーズ 2: 重要なモデルとインターフェースの移行

1. **共通インターフェース定義ファイルの作成**:
   - `types/index.ts` ファイルを作成し、共通の型定義を集約

2. **データモデルの移行**:
   - 最初に `models/` ディレクトリ内のファイルを `.ts` に変換
   - Mongoose スキーマに型情報を追加
   - 例: `Theme.js` → `Theme.ts`

3. **API レスポンス型の定義**:
   - API レスポンスの型定義を作成し、一貫性を確保

### フェーズ 3: コアサービスとユーティリティの移行

1. **ユーティリティ関数の移行**:
   - 共通ユーティリティを TypeScript に変換
   - 例: `services/llmService.js` → `services/llmService.ts`

2. **認証サービスの移行**:
   - セキュリティ関連コードを優先的に移行
   - 例: `services/auth/` ディレクトリ内のファイル

3. **ワーカーの移行**:
   - バックグラウンド処理を行うワーカーを移行
   - 例: `workers/questionGenerator.js` → `workers/questionGenerator.ts`

### フェーズ 4: コントローラーとルートの移行

1. **コントローラーの移行**:
   - リクエスト/レスポンスの型付けを追加
   - 例: `controllers/themeController.js` → `controllers/themeController.ts`

2. **ルートの移行**:
   - Express ルートに型情報を追加
   - 例: `routes/themeRoutes.js` → `routes/themeRoutes.ts`

3. **メインサーバーファイルの移行**:
   - 最後に `server.js` を `server.ts` に変換

### フェーズ 5: 型チェックの厳格化

1. **tsconfig.json の更新**:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "checkJs": true
     }
   }
   ```

2. **型エラーの解決**:
   - 厳格な型チェックで発見されたエラーを修正
   - `any` 型の使用を最小限に抑える

3. **テストの追加/更新**:
   - 型変更に伴うテストの更新
   - 型安全性を確認するテストの追加

## 優先順位の高いファイル

以下のファイルは、重要性と影響範囲を考慮して優先的に移行すべきです：

1. **モデル定義**:
   - `models/Theme.js`
   - `models/SharpQuestion.js`
   - `models/Problem.js`
   - `models/Solution.js`
   - `models/ChatThread.js`

2. **認証関連**:
   - `services/auth/`
   - `controllers/authController.js`

3. **コアビジネスロジック**:
   - `controllers/themeController.js`
   - `controllers/questionController.js`
   - `workers/questionGenerator.js`

4. **API クライアント連携**:
   - `services/llmService.js`

## 移行時の注意点

1. **互換性の維持**:
   - 既存の JavaScript コードと新しい TypeScript コードが共存できるようにする
   - API の互換性を維持する

2. **段階的なアプローチ**:
   - 一度にすべてを変換せず、小さな単位で変換してテスト
   - 各フェーズ後に動作確認を行う

3. **any 型の使用**:
   - 初期段階では `any` 型を許容し、後で具体的な型に置き換える
   - 複雑な型は段階的に改善

4. **テスト駆動開発**:
   - 移行前にテストを書き、移行後も同じテストが通ることを確認

## 参考リソース

- policy-edit バックエンドの TypeScript 実装
- [TypeScript 公式ドキュメント](https://www.typescriptlang.org/docs/)
- [Mongoose と TypeScript の統合ガイド](https://mongoosejs.com/docs/typescript.html)
- [Express と TypeScript の統合ガイド](https://expressjs.com/en/resources/frameworks/typescript.html)

## タイムライン

- **フェーズ 1**: 1-2 日
- **フェーズ 2**: 2-3 日
- **フェーズ 3**: 2-3 日
- **フェーズ 4**: 3-4 日
- **フェーズ 5**: 2-3 日

合計: 約 2 週間（並行作業の場合はより短縮可能）
