import React from "react";
import { useEffect, useState } from "react";
import type { FC } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ThemeForm from "../components/theme/ThemeForm";
import { apiClient } from "../services/api/apiClient";
import type { Theme } from "../services/api/types";

const ThemeEdit: FC = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTheme = async () => {
      if (!themeId) {
        navigate("/themes");
        return;
      }

      setLoading(true);
      const result = await apiClient.getThemeById(themeId);

      result.match(
        (data) => {
          setTheme(data);
          setError(null);
        },
        (error) => {
          console.error(`Failed to fetch theme ${themeId}:`, error);
          setError("テーマの取得に失敗しました。");
        }
      );

      setLoading(false);
    };

    fetchTheme();
  }, [themeId, navigate]);

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
    );
  }

  if (!theme) {
    return <div className="text-center py-4">テーマが見つかりません。</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">テーマ編集: {theme.title}</h1>
      <ThemeForm theme={theme} isEdit />

      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-bold mb-4">質問管理機能</h2>
        <div className="flex space-x-4">
          <Link
            to={`/themes/${theme._id}/embeddings`}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            埋め込み生成
          </Link>
          <Link
            to={`/themes/${theme._id}/vector-search`}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            ベクトル検索
          </Link>
          <Link
            to={`/themes/${theme._id}/clustering`}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            クラスタリング
          </Link>
          <Link
            to={`/themes/${theme._id}/questions/report-examples`}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            市民意見レポート例を更新する
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThemeEdit;
