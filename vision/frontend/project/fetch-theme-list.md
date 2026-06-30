# テーマ一覧ページの実データ取得実装計画

## 概要

現在、`frontend/src/pages/Themes.tsx`ページではモックデータを使用していますが、これを`frontend/src/services/api/apiClient.ts`を利用して実際の API からデータを取得するように変更します。

## 現状分析

### フロントエンド

1. **Themes.tsx**:

   - 現在はハードコードされたモックデータ(`themesData`)を使用
   - ThemeCard コンポーネントに`id`, `title`, `description`, `keyQuestionCount`, `commentCount`を渡している

2. **apiClient.ts**:

   - `getAllThemes()`メソッドが実装されている
   - 戻り値の型は`HttpResult<Theme[]>`

3. **Theme 型**:
   - `_id`, `title`, `slug`のみを持つ
   - ThemeCard が期待する`description`, `keyQuestionCount`, `commentCount`がない

### バックエンド

1. **Theme model**:

   - `_id`, `title`, `description`, `slug`, `isActive`フィールドを持つ

2. **themeController.js**:

   - `getAllThemes`メソッドは基本的なテーマ情報のみを返す
   - 関連するキークエスチョン数やコメント数は含まれていない

3. **SharpQuestion model**:
   - `themeId`フィールドでテーマと関連付けられている
   - これを使ってテーマごとのキークエスチョン数をカウントできる

## 実装計画

### 1. バックエンドの修正

バックエンドの`getAllThemes`コントローラーを拡張して、各テーマに関連するキークエスチョン数とコメント数を含めるようにします。

```javascript
// idea-discussion/backend/controllers/themeController.js の修正

export const getAllThemes = async (req, res) => {
  try {
    // 基本的なテーマ情報を取得
    const themes = await Theme.find({ isActive: true }).sort({ createdAt: -1 });

    // 拡張されたテーマ情報を格納する配列
    const enhancedThemes = [];

    // 各テーマについて関連データを取得
    for (const theme of themes) {
      // キークエスチョン数をカウント
      const keyQuestionCount = await SharpQuestion.countDocuments({
        themeId: theme._id,
      });

      // コメント数をカウント（実際のコメントモデルに合わせて調整が必要）
      // 例: ChatThreadのメッセージ数や、別のコメントモデルのカウント
      const commentCount = await ChatThread.countDocuments({
        themeId: theme._id,
      });

      // 拡張されたテーマ情報を追加
      enhancedThemes.push({
        _id: theme._id,
        id: theme._id, // フロントエンドの互換性のため
        title: theme.title,
        description: theme.description || "",
        slug: theme.slug,
        keyQuestionCount,
        commentCount,
      });
    }

    res.status(200).json(enhancedThemes);
  } catch (error) {
    console.error("Error fetching all themes:", error);
    res
      .status(500)
      .json({ message: "Error fetching themes", error: error.message });
  }
};
```

注意: 実際のコメント数のカウント方法は、プロジェクトの構造によって異なる可能性があります。適切なモデルやフィールドを使用してください。

### 2. フロントエンドの型定義の更新

バックエンドから返される拡張されたテーマ情報に合わせて、フロントエンドの型定義を更新します。

```typescript
// frontend/src/types.ts の修正

export interface Theme {
  _id: string;
  id?: string; // バックエンドとの互換性のため
  title: string;
  description?: string;
  slug: string;
  keyQuestionCount?: number;
  commentCount?: number;
}
```

### 3. Themes.tsx ページの修正

API クライアントを使用して実際のデータを取得するように`Themes.tsx`を修正します。try-catch は不要です。

```typescript
// frontend/src/pages/Themes.tsx の修正

import { useRef, useState, useEffect } from "react";
import {
  FloatingChat,
  type FloatingChatRef,
} from "../components/chat/FloatingChat";
import BreadcrumbView from "../components/common/BreadcrumbView";
import ThemeCard from "../components/home/ThemeCard";
import { apiClient } from "../services/api/apiClient";
import type { Theme } from "../types";

const Themes = () => {
  const breadcrumbItems = [
    { label: "TOP", href: "/" },
    { label: "テーマ一覧", href: "/themes" },
  ];

  const chatRef = useRef<FloatingChatRef>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThemes = async () => {
      setIsLoading(true);
      setError(null);

      const result = await apiClient.getAllThemes();

      if (result.isOk()) {
        setThemes(result.value);
      } else {
        setError("テーマの取得に失敗しました: " + result.error.message);
        console.error("Error fetching themes:", result.error);
      }

      setIsLoading(false);
    };

    fetchThemes();
  }, []);

  const handleSendMessage = (message: string) => {
    console.log("Message sent:", message);

    setTimeout(() => {
      chatRef.current?.addMessage("メッセージを受け取りました。", "system");
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbView items={breadcrumbItems} />

      <h1 className="text-2xl md:text-3xl font-bold mb-4">議論テーマ一覧</h1>

      <p className="text-sm text-neutral-600 mb-8">
        全国から寄せられた多様な意見をもとに、重要な社会課題について議論するテーマを設定しています。
        関心のあるテーマに参加して、あなたの声を政策づくりに活かしましょう。
      </p>

      {isLoading && (
        <div className="text-center py-8">
          <p>テーマを読み込み中...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && themes.length === 0 && (
        <div className="text-center py-8">
          <p>テーマがありません。</p>
        </div>
      )}

      {!isLoading && !error && themes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mb-12">
          {themes.map((theme) => (
            <ThemeCard
              key={theme._id}
              id={Number(theme._id)} // ThemeCardがnumber型を期待しているため変換
              title={theme.title}
              description={theme.description || ""}
              keyQuestionCount={theme.keyQuestionCount || 0}
              commentCount={theme.commentCount || 0}
            />
          ))}
        </div>
      )}

      <FloatingChat ref={chatRef} onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Themes;
```

## 実装上の注意点

1. **バックエンドの修正**:

   - `getAllThemes`コントローラーの修正は、パフォーマンスに影響する可能性があります。各テーマに対して追加のクエリを実行するため、テーマ数が多い場合は処理時間が長くなる可能性があります。
   - より効率的な実装として、MongoDB の集計パイプラインを使用することも検討できます。

2. **型の互換性**:

   - バックエンドから返される`_id`は MongoDB の ObjectID ですが、ThemeCard は数値の`id`を期待しています。適切な変換が必要です。

3. **エラーハンドリング**:

   - apiClient は既に Result オブジェクトを返すため、追加の try-catch は不要です。
   - Result オブジェクトの isOk()メソッドを使用して成功/失敗を判断し、適切に処理します。

4. **ローディング状態**:

   - データ取得中はローディング状態を表示し、ユーザーエクスペリエンスを向上させます。

## テスト計画

1. バックエンドの修正後、API エンドポイントが正しく拡張されたテーマ情報を返すことを確認します。
2. フロントエンドの修正後、テーマ一覧ページが正しくデータを表示することを確認します。
3. エラー状態やローディング状態が適切に表示されることを確認します。

## 将来の改善点

1. **ページネーション**:

   - テーマ数が多い場合、ページネーションを実装することでパフォーマンスを向上させることができます。

2. **キャッシング**:

   - 頻繁に変更されないデータはクライアント側でキャッシュすることで、API リクエストの回数を減らすことができます。

3. **リアルタイム更新**:
   - WebSocket や Server-Sent Events を使用して、新しいテーマやコメントがあった場合にリアルタイムで更新することができます。
