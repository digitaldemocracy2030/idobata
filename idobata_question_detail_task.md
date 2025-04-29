
# idobata 問い個別ページ作成手順書

## 0. 目的

idobataプロジェクトにおいて、  
問い個別ページ（/themes/{themeId}/questions/{qId}）を拡張性・保守性を考慮した設計で作成する。

- パンクズ表示対応
- キークエスチョン・議論サマリー・意見一覧をコンポーネント化
- モバイルファースト対応

---

## 1. 作業手順

### 1.1 ページファイルを作成する

- `src/pages/QuestionDetail.tsx` を新規作成する

---

### 1.2 共通コンポーネントを再利用・作成する

#### 1.2.1 BreadcrumbView.tsx

- すでに存在する`BreadcrumbView`を使う
- 使用例：
  ```tsx
  <BreadcrumbView items={[
    { label: "TOP", href: "/" },
    { label: "テーマ一覧", href: "/themes" },
    { label: "若者の雇用とキャリア支援", href: "/themes/xxx" },
    { label: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？", href: "/themes/xxx/questions/yyy" },
  ]} />
  ```

---

### 1.3 新規コンポーネントを作成する

#### 1.3.1 KeyQuestionHeader.tsx

- 作成場所：`src/components/question/KeyQuestionHeader.tsx`
- 役割：キークエスチョンタイトルと投票ボタンを表示
- Props仕様（想定）：
  ```tsx
  interface KeyQuestionHeaderProps {
    question: string;
    voteCount: number;
  }
  ```

#### 1.3.2 DebateSummary.tsx

- 作成場所：`src/components/question/DebateSummary.tsx`
- 役割：議論の要点・対立軸をまとめて表示
- Props仕様（想定）：
  ```tsx
  interface DebateSummaryProps {
    axes: {
      title: string;
      options: { label: string; description: string }[];
    }[];
    agreementPoints: string[];
    disagreementPoints: string[];
  }
  ```

#### 1.3.3 OpinionCard.tsx

- 作成場所：`src/components/question/OpinionCard.tsx`
- 役割：寄せられた意見（課題点・解決策）を表示する小型カード
- Props仕様（想定）：
  ```tsx
  interface OpinionCardProps {
    type: "課題点" | "解決策";
    text: string;
    relevance: number;
  }
  ```

#### 1.3.4 CitizenReportExample.tsx

- 作成場所：`src/components/question/CitizenReportExample.tsx`
- 役割：市民意見レポートの例文を表示
- Props仕様（想定）：
  ```tsx
  interface CitizenReportExampleProps {
    introduction: string;
    issues: { title: string; description: string }[];
  }
  ```

---

### 1.4 ページ組み立て（QuestionDetail.tsx）

- ページ上部に `<BreadcrumbView />`
- メインエリアに以下を表示：

  1. キークエスチョンタイトル＆投票ボタン（`KeyQuestionHeader`）
  2. 「論点サマリー」セクション
    - イラストまとめ／論点分析タブ
    - 主要な論点と対立軸（`DebateSummary`）
    - 合意形成の状況
  3. 寄せられた意見セクション
    - 「課題点」と「解決策」タブ
    - 各意見を`OpinionCard`で表示
  4. 市民意見レポート例（`CitizenReportExample`）
  5. ページ最下部にsrc/components/chat/FloatingChat.tsx

- 質問エリアは簡単な仮実装でOK（API接続なし）

---

## 2. スタイル指針

- セクション間に適度なマージン（`py-8`など）
- タイトルは大きめ`h1`
- 小見出しは`h2`
- カードレイアウトはモバイル対応
- タブ切り替えはシンプルに（デザインライブラリ使わず最小実装でも可）
- モバイルファースト設計

---

# ✅ これで問い個別ページ（/themes/{themeId}/questions/{qId}）の作成作業が完了します！
