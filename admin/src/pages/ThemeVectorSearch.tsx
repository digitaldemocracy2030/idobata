import React, { useState } from "react";
import type { ChangeEvent, FC, FormEvent } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { apiClient } from "../services/api/apiClient";
import type { VectorSearchParams, VectorSearchResult } from "../services/api/types";

const ThemeVectorSearch: FC = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const [searchParams, setSearchParams] = useState<VectorSearchParams>({
    queryText: "",
    itemType: "problem",
    k: 10,
  });
  const [results, setResults] = useState<VectorSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setSearchParams((prev) => ({
      ...prev,
      [name]: name === "k" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!themeId) {
      setError("テーマIDが見つかりません。");
      return;
    }

    if (!searchParams.queryText.trim()) {
      setError("検索テキストを入力してください。");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await apiClient.searchTheme(themeId, searchParams);

    result.match(
      (data) => {
        setResults(data);
        if (data.length === 0) {
          setError("検索結果が見つかりませんでした。");
        }
      },
      (error) => {
        console.error("Vector search error:", error);
        setError(`検索中にエラーが発生しました: ${error.message}`);
        setResults([]);
      }
    );

    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ベクトル検索</h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl mb-8">
        <Input
          label="検索テキスト"
          name="queryText"
          value={searchParams.queryText}
          onChange={handleChange}
          placeholder="検索したいテキストを入力してください"
          required
        />

        <div className="mb-4">
          <label htmlFor="itemType" className="block text-gray-700 font-medium mb-2">
            アイテムタイプ
          </label>
          <select
            id="itemType"
            name="itemType"
            value={searchParams.itemType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="problem">問題</option>
            <option value="solution">解決策</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="k" className="block text-gray-700 font-medium mb-2">
            結果数
          </label>
          <input
            type="number"
            id="k"
            name="k"
            value={searchParams.k}
            onChange={handleChange}
            min="1"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "検索中..." : "検索"}
        </Button>
      </form>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">検索結果 ({results.length}件)</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {results.map((result) => (
              <div key={result.id} className="p-4 border-b last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-800">{result.text}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      ID: {result.id}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      類似度: {(result.similarity * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeVectorSearch;
