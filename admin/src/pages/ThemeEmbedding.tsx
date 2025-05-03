import React, { useState } from "react";
import type { ChangeEvent, FC, FormEvent } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import { apiClient } from "../services/api/apiClient";

const ThemeEmbedding: FC = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const [itemType, setItemType] = useState<"problem" | "solution" | "">("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    status: string;
    processedCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setItemType(e.target.value as "problem" | "solution" | "");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!themeId) {
      setError("テーマIDが見つかりません。");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const result = await apiClient.generateThemeEmbeddings(
      themeId,
      itemType || undefined
    );

    result.match(
      (data) => {
        setResult(data);
      },
      (error) => {
        console.error("Embedding generation error:", error);
        setError(`埋め込み生成中にエラーが発生しました: ${error.message}`);
      }
    );

    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">埋め込み生成</h1>

      <div className="bg-info/10 p-4 rounded mb-6">
        <p className="text-sm text-muted-foreground">
          注:
          ベクトル検索やクラスタリングを使用する前に、アイテムの埋め込みを生成する必要があります。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mb-8">
        <div className="mb-4">
          <label
            htmlFor="itemType"
            className="block text-gray-700 font-medium mb-2"
          >
            アイテムタイプ（オプション）
          </label>
          <select
            id="itemType"
            name="itemType"
            value={itemType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">すべて</option>
            <option value="problem">問題のみ</option>
            <option value="solution">解決策のみ</option>
          </select>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "処理中..." : "埋め込み生成"}
        </Button>
      </form>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      {result && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          <p>ステータス: {result.status}</p>
          <p>処理済みアイテム数: {result.processedCount}</p>
        </div>
      )}
    </div>
  );
};

export default ThemeEmbedding;
