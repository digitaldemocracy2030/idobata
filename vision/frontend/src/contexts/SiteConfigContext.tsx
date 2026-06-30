import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "../services/api/apiClient";

interface SiteConfig {
  _id: string;
  title: string;
  aboutMessage: string;
}

interface SiteConfigContextType {
  siteConfig: SiteConfig | null;
  loading: boolean;
  error: string | null;
}

const SiteConfigContext = createContext<SiteConfigContextType>({
  siteConfig: null,
  loading: true,
  error: null,
});

export const useSiteConfig = () => useContext(SiteConfigContext);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteConfig = async () => {
      const result = await apiClient.getSiteConfig();

      result.match(
        (data) => {
          setSiteConfig(data);
          setError(null);
        },
        (error) => {
          console.error("Failed to fetch site config:", error);
          setError("サイト設定の取得に失敗しました");
          setSiteConfig({
            _id: "default",
            title: "XX党 みんなの政策フォーラム",
            aboutMessage: `# XX党みんなの政策フォーラムとは

XX党みんなの政策フォーラムは、市民の声を政策に反映させるためのオンラインプラットフォームです。
誰もが自由に意見を投稿し、議論に参加することができます。
私たちは、より良い社会を実現するために、皆様の声を大切にしています。

## 話し合いの流れ

### ステップ1：問題を見つける
日常生活で感じる課題や問題点を投稿してください。
他の参加者の投稿を見て、共感できる問題に「いいね」をつけることもできます。

### ステップ2：アイデアをつくる
問題に対する解決策やアイデアを提案してください。
他の参加者のアイデアにコメントを付けたり、改善案を提案することもできます。

## 誰でも参加できます

このフォーラムは、年齢や職業、居住地に関係なく、誰でも参加できます。
匿名での投稿も可能で、専門知識は必要ありません。
あなたの日常の経験や感じたことが、より良い政策づくりにつながります。

## XX党みんなの政策フォーラムのめざすこと

私たちは、市民の声を直接政策に反映させることで、より民主的で開かれた政治を実現することを目指しています。
このフォーラムを通じて、多様な意見が交わされ、建設的な議論が生まれることを期待しています。

## 声をあげるのは、あなたの番かもしれません

社会を変えるのは、一人ひとりの小さな声の積み重ねです。
あなたの意見が、明日の政策につながるかもしれません。
ぜひ、このフォーラムに参加して、あなたの声を聞かせてください。`,
          });
        }
      );

      setLoading(false);
    };

    fetchSiteConfig();
  }, []);

  return (
    <SiteConfigContext.Provider value={{ siteConfig, loading, error }}>
      {children}
    </SiteConfigContext.Provider>
  );
};
