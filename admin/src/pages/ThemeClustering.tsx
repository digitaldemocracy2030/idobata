import React, { useState } from "react";
import type { ChangeEvent, FC, FormEvent } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import { apiClient } from "../services/api/apiClient";
import type { Cluster, ClusteringParams, ClusteringResult } from "../services/api/types";

const ThemeClustering: FC = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const [clusteringParams, setClusteringParams] = useState<ClusteringParams>({
    itemType: "problem",
    method: "kmeans",
    params: {
      n_clusters: 5,
    },
  });
  const [results, setResults] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "n_clusters") {
      setClusteringParams((prev) => ({
        ...prev,
        params: {
          ...prev.params,
          n_clusters: parseInt(value, 10),
        },
      }));
    } else {
      setClusteringParams((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!themeId) {
      setError("テーマIDが見つかりません。");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await apiClient.clusterTheme(themeId, clusteringParams);

    result.match(
      (data) => {
        setResults(data.clusters);
        if (data.clusters.length === 0) {
          setError("クラスタリング結果が見つかりませんでした。");
        }
      },
      (error) => {
        console.error("Clustering error:", error);
        setError(`クラスタリング中にエラーが発生しました: ${error.message}`);
        setResults([]);
      }
    );

    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">クラスタリング</h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl mb-8">
        <div className="mb-4">
          <label htmlFor="itemType" className="block text-gray-700 font-medium mb-2">
            アイテムタイプ
          </label>
          <select
            id="itemType"
            name="itemType"
            value={clusteringParams.itemType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="problem">問題</option>
            <option value="solution">解決策</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="method" className="block text-gray-700 font-medium mb-2">
            クラスタリング方法
          </label>
          <select
            id="method"
            name="method"
            value={clusteringParams.method}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="kmeans">K-means</option>
            <option value="hierarchical">階層的クラスタリング</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="n_clusters" className="block text-gray-700 font-medium mb-2">
            クラスター数
          </label>
          <input
            type="number"
            id="n_clusters"
            name="n_clusters"
            value={clusteringParams.params?.n_clusters}
            onChange={handleChange}
            min="2"
            max="20"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "処理中..." : "クラスタリング実行"}
        </Button>
      </form>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">クラスタリング結果 ({results.length}クラスター)</h2>
          
          <div className="space-y-6">
            {results.map((cluster) => (
              <div key={cluster.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b">
                  <h3 className="font-medium">クラスター {cluster.id + 1}</h3>
                  <p className="text-sm text-gray-500">{cluster.items.length}アイテム</p>
                </div>
                
                <div className="divide-y">
                  {cluster.items.map((item) => (
                    <div key={item.id} className="p-4">
                      <p className="text-gray-800">{item.text}</p>
                      <p className="text-sm text-gray-500 mt-1">ID: {item.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeClustering;
