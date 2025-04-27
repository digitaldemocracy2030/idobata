# idobata TOPページ作成作業手順書（Vite + React版・現状構成に最適化・pages/Top.tsxに実装・アイコン明記版）

## 0. 目的

この作業では、提供されたモック画像をもとに、
**shadcn/ui + TailwindCSS**を使用して、**静的なTOPページ**を作成する。
モック画像: frontend/project/imgs/toppage-design.png

- Vite + React環境で開発する
- 既存プロジェクト構成を尊重する
- `src/pages/Top.tsx`に全体を実装する

## 1. 現状構成確認

現在プロジェクトには：

- `src/components/`：小コンポーネント
- `src/pages/`：ページコンポーネント

が存在しており、`MainPage.tsx`などが配置されている。
今回新たに `Top.tsx` を追加して、**TOPページ**を構成する。

## 2. コンポーネント構成

新規に作るコンポーネントは、**すべて`src/components/`配下**に設置する。

```
/src/components
  /layout
    Header.tsx
    Footer.tsx
  /home
    HeroSection.tsx
    SectionTitle.tsx
    DiscussionCard.tsx
    ThemeCard.tsx
    SeeMoreButton.tsx
```

## 3. コンポーネント作成手順

### 3.1 `/src/components/layout/Header.tsx`

- ハンバーガーメニュー（`Sheet`使用、左スライドイン）
- 中央にサイトタイトル：「XX党 みんなの政策フォーラム」
- 右にマイページアイコン（ghostボタン）
- **アイコンについて**:
  - すべて `lucide-react` を使用する
  - ハンバーガーメニュー：`Menu`
  - マイページアイコン：`User`
  - アイコンサイズは基本 `h-6 w-6` で統一
- リンクリスト：
  - ホーム（`/top`）
  - このサイトについて（`/about`）
  - マイページ（`/mypage`）

### 3.2 `/src/components/layout/Footer.tsx`

- 中央寄せ小テキスト
- 文言：「© 2025 デジタル民主主義2030」

### 3.3 `/src/components/home/HeroSection.tsx`

- メインコピー：「あなたの声から、政策が動き出す」
- サブコピー：「社会をもっと良くするヒントは、あなたの実感にあります。」
- 仮イメージ
- 「このサイトについて」ボタン（`/about`リンク）

### 3.4 `/src/components/home/SectionTitle.tsx`

- h2見出し
- Propsで`title`受け取り

### 3.5 `/src/components/home/DiscussionCard.tsx`

- タイトル、課題数、解決策数を表示
- 右端に矢印ボタン
- hover時にシャドウ追加

### 3.6 `/src/components/home/ThemeCard.tsx`

- DiscussionCardと同様

### 3.7 `/src/components/home/SeeMoreButton.tsx`

- 小さめoutlineボタン
- テキスト：「もっと見る →」

## 4. Topページ（`src/pages/Top.tsx`）組み立て

- `<Header />`
- `<HeroSection />`
- `<SectionTitle title="人気の重要論点" />`
- 複数 `<DiscussionCard />`
- `<SeeMoreButton />`
- `<SectionTitle title="意見募集中テーマ" />`
- 複数 `<ThemeCard />`
- `<SeeMoreButton />`
- `<Footer />`

仮データで埋める。
セクション間の上下余白を適切に（例：py-8）。

## 5. 仮データ例

### 人気の重要論点（DiscussionCard用）

| タイトル             | 課題数 | 解決策数 |
| :------------------- | :----- | :------- |
| 教育格差の是正       | 12     | 34       |
| エネルギー政策の未来 | 8      | 20       |

### 意見募集中テーマ（ThemeCard用）

| タイトル         | 課題数 | 解決策数 |
| :--------------- | :----- | :------- |
| 子育て支援の拡充 | 5      | 10       |
| 防災とまちづくり | 3      | 7        |

## 6. 使用アイコンについて

- 本プロジェクトで使用するアイコンはすべて**`lucide-react`**からインポートすること。
- 例：
  ```tsx
  import { Menu, User, ArrowRight } from 'lucide-react';
  ```
- アイコンはshadcn/uiコンポーネントと自然に組み合わせる。
- アイコンサイズは統一して `h-6 w-6` クラスを付与する。

---

# ✅ 完了
