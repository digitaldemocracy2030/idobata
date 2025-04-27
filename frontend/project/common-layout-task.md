# 共通ヘッダー・フッター実装タスク

## 背景
現在、`Top.tsx`ページにはヘッダーとフッターが実装されていますが、`About.tsx`、`ThemeDetail.tsx`、`Themes.tsx`にも同様のヘッダー・フッターを追加する必要があります。また、今後もページ数は増えていく予定です。

## 実装アプローチ
再利用可能な`PageLayout`コンポーネントを作成し、ルーター設定を更新して該当するページでこのレイアウトを使用する方法を採用します。

## タスクリスト

1. ✅ 完了: `src/components/layout/PageLayout.tsx`コンポーネントを作成する
   - Header と Footer コンポーネントをインポートする
   - children を props として受け取り、ページコンテンツをレンダリングする
   - `Top.tsx`と同じ構造（min-h-screen, flex-col, pt-14 など）でコンテンツをラップする

2. ✅ 完了: `App.tsx`のルーター設定を更新する
   - `Top`、`About`、`Themes`、`ThemeDetail`ページに`PageLayout`を適用する
   - 各ページを`PageLayout`でラップする

3. `Top.tsx`を更新する
   - 直接インポートしている Header と Footer を削除する（レイアウトから提供されるため）
   - ページの構造を調整して、レイアウトコンポーネントと連携するようにする

4. 他のページ（`About.tsx`、`ThemeDetail.tsx`、`Themes.tsx`）を更新する
   - 外側のコンテナ div を削除または調整する（レイアウトから提供されるため）
   - 必要に応じてスタイルを調整する

5. 実装をテストする
   - 各ページでヘッダーとフッターが正しく表示されることを確認する
   - ページ間のナビゲーションが正常に機能することを確認する

## コード例

### PageLayout.tsx
```tsx
import Header from './Header';
import Footer from './Footer';
import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col pt-14">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
```

### App.tsx（ルーター設定の更新例）
```tsx
import PageLayout from './components/layout/PageLayout';

// ...

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // 既存の AppLayout 関連のルート
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <MainPage /> },
          { path: 'data', element: <DataPage /> },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
      // PageLayout を使用するルート
      {
        path: 'top',
        element: (
          <PageLayout>
            <Top />
          </PageLayout>
        ),
      },
      {
        path: 'about',
        element: (
          <PageLayout>
            <About />
          </PageLayout>
        ),
      },
      {
        path: 'themes',
        element: (
          <PageLayout>
            <Themes />
          </PageLayout>
        ),
      },
      {
        path: 'themes/:themeId',
        element: (
          <PageLayout>
            <ThemeDetail />
          </PageLayout>
        ),
      },
    ],
  },
]);
```

## メリット

1. **スケーラビリティ**: 新しいページが追加された場合も、同じレイアウトを簡単に適用できる
2. **保守性**: ヘッダーやフッターに変更が必要な場合、1か所だけ修正すれば良い
3. **一貫性**: すべてのページで同じレイアウト構造を確保できる

## 注意点

1. 既存の`AppLayout`は古いページ（`MainPage`、`DataPage`）用なので、そのまま残しておく
2. 各ページのコンテンツ部分のスタイリングは、レイアウト変更に合わせて調整が必要かもしれない
