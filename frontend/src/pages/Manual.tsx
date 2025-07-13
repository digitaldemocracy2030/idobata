import BreadcrumbView from "../components/common/BreadcrumbView";
import { useSiteConfig } from "../contexts/SiteConfigContext";

const Manual = () => {
  const breadcrumbItems = [
    { label: "TOP", href: "/" },
    { label: "使い方", href: "/manual" },
  ];

  const { loading } = useSiteConfig();

  return (
    <div className="container mx-auto px-4 py-8 xl:max-w-none">
      <BreadcrumbView items={breadcrumbItems} />

      {loading ? (
        <div className="text-center py-4">読み込み中...</div>
      ) : (
        <div className="prose max-w-none">
          <h1>りっけん対話アリーナの使い方</h1>
          <p>
            システムには、ユーザーがAIとチャットできる機能が組み込まれています
          </p>
          <ol>
            <li>
              メインページの左側インデックスおよび下部（モバイルでは下部）に、Xで募集した、大きな意見募集中テーマがあります。
            </li>
            <li>
              この中から議論したいテーマを選び、クリックし、大きなテーマ別のページへお入りください。
            </li>
            <li>
              ページの左側に大きなテーマ、その下にはいくつかの重要論点があります。
            </li>
            <li>
              重要論点のページに入ります。左側に論点サマリー（イラストまとめ、論点まとめ）と今まで寄せられた意見が表示されます
            </li>
            <li>
              テキストボックスにメッセージを入力し、送信ボタンをクリックするか、Enterキーを押します。
            </li>
            <li>AIが応答し、会話が続きます。</li>
            <li>「話題を変える」ボタンで新しい会話を始めることができます。</li>
          </ol>
        </div>
      )}

      <div className="text-center mt-12">
        <a
          href="https://cdp-japan.jp/"
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          © cdp-japan.jp
        </a>
      </div>
    </div>
  );
};

export default Manual;
