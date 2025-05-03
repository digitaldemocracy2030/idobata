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

管理画面では直接カラーコードを使用している箇所がありますが、Tailwindのカラークラスを活用して一元管理することを推奨します：

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Tailwindのデフォルトカラーを活用
      },
    },
  },
}
```

### 色の使用ガイドライン

- **テキスト**:
  - 本文: text-gray-700
  - 見出し: text-gray-900
  - リンク: text-blue-600

- **背景**:
  - ページ背景: bg-white
  - セクション背景: bg-gray-50
  - カード背景: bg-white

- **アクセント**:
  - ボタン（プライマリ）: bg-blue-600
  - ボタン（セカンダリ）: bg-gray-200
  - ボタン（デンジャー）: bg-red-600
  - 警告: bg-yellow-100
  - 成功: bg-green-100
  - エラー: bg-red-100
  - 情報: bg-blue-100

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

Buttonコンポーネントを使用し、様々なバリエーションを活用します：

- **バリアント**: primary, secondary, danger
- **状態**: 通常, disabled

```jsx
import Button from "../components/ui/Button";

// 使用例
<Button variant="primary">ボタン</Button>
<Button variant="secondary">キャンセル</Button>
<Button variant="danger" disabled={true}>削除</Button>
```

#### 入力フィールド

Inputコンポーネントを使用してフォーム入力を処理します：

```jsx
import Input from "../components/ui/Input";

// 使用例
<Input
  label="タイトル"
  name="title"
  value={title}
  onChange={handleChange}
  required={true}
  error={errors.title}
/>
```

#### アラート

Alertコンポーネントを使用して、様々なタイプのメッセージを表示します：

- **タイプ**: success, error, warning, info

```jsx
import Alert from "../components/ui/Alert";

// 使用例
<Alert type="success">保存が完了しました</Alert>
<Alert type="error">エラーが発生しました</Alert>
<Alert type="warning">注意してください</Alert>
<Alert type="info">情報メッセージ</Alert>
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
