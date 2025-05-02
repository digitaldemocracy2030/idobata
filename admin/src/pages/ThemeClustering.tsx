import React, { useState } from "react";
import type { ChangeEvent, FC, FormEvent } from "react";
import { useParams } from "react-router-dom";
import HierarchicalClusterView from "../components/clustering/HierarchicalClusterView"; // Import the new component
import Button from "../components/ui/Button";
import { apiClient } from "../services/api/apiClient";
import type {
  ClusteredItem,
  ClusteringParams,
  ClusteringResult,
  HierarchicalClusterNode,
} from "../services/api/types";

const ThemeClustering: FC = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const [clusteringParams, setClusteringParams] = useState<ClusteringParams>({
    itemType: "problem",
    method: "kmeans",
    params: {
      n_clusters: 5,
      distance_threshold: undefined, // Add distance_threshold
    },
  });
  // State now holds the raw clustering result (flat array or hierarchical tree)
  const [clusteringResult, setClusteringResult] = useState<
    ClusteredItem[] | HierarchicalClusterNode | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedClusters, setExpandedClusters] = useState<Set<number>>(
    new Set()
  ); // State for expanded clusters

  // Derived state: Group items by cluster index for rendering (ONLY for K-Means)
  const groupedClusters = React.useMemo(() => {
    // Only compute if the result is an array (k-means)
    if (!clusteringResult || !Array.isArray(clusteringResult)) {
      return {};
    }
    // Group items by their 'cluster' property
    return clusteringResult.reduce(
      (acc, item) => {
        const clusterIndex = item.cluster;
        if (!acc[clusterIndex]) {
          acc[clusterIndex] = [];
        }
        acc[clusterIndex].push(item);
        return acc;
      },
      {} as Record<number, ClusteredItem[]>
    );
  }, [clusteringResult]); // Depend on the raw result

  // Determine cluster count based on the result type
  const clusterCount = React.useMemo(() => {
    if (!clusteringResult) return 0;
    if (Array.isArray(clusteringResult)) {
      // K-means: count unique cluster indices
      const uniqueClusters = new Set(
        clusteringResult.map((item) => item.cluster)
      );
      return uniqueClusters.size;
    }
    // Hierarchical: Often considered 1 tree, or count can be derived differently if needed.
    // Let's just indicate that a result exists.
    // This code is reached only if clusteringResult exists and is not an array.
    return 1; // Or perhaps count leaf nodes? For now, 1 indicates a result.
  }, [clusteringResult]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const valueAsNumber = Number.parseFloat(value); // Use parseFloat for threshold

    if (name === "n_clusters") {
      // Only update n_clusters if method is kmeans
      if (clusteringParams.method === "kmeans") {
        setClusteringParams((prev) => ({
          ...prev,
          params: {
            ...prev.params, // Keep existing params (like distance_threshold if it was there, though it shouldn't be for kmeans)
            n_clusters: Number.isNaN(valueAsNumber)
              ? undefined
              : Math.round(valueAsNumber),
            distance_threshold: undefined, // Ensure distance_threshold is cleared for kmeans
          },
        }));
      }
      // Ignore n_clusters change if method is hierarchical
    } else if (name === "distance_threshold") {
      // Ignore distance_threshold change entirely as it's removed for hierarchical
      // If we were keeping it for hierarchical, logic would go here.
    } else if (name === "method") {
      // When method changes, reset params
      setClusteringParams((prev) => ({
        ...prev,
        method: value as "kmeans" | "hierarchical",
        // Reset params based on new method
        params:
          value === "kmeans"
            ? { n_clusters: prev.params?.n_clusters || 5 } // Default for kmeans
            : {}, // Empty params for hierarchical
      }));
    } else {
      // Handles itemType
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

    // Clean up params before sending: send only relevant param for hierarchical
    const paramsToSend = { ...clusteringParams };

    // Ensure params object exists before modifying it
    if (!paramsToSend.params) {
      paramsToSend.params = {};
    }

    if (paramsToSend.method === "hierarchical") {
      // Hierarchical: Always send empty params
      paramsToSend.params = {};
    } else {
      // K-means: Ensure n_clusters is set, default to 5 if not present
      paramsToSend.params = {
        n_clusters: paramsToSend.params?.n_clusters ?? 5,
      };
    }

    const result = await apiClient.clusterTheme(themeId, paramsToSend);

    result.match(
      (data: ClusteringResult) => {
        // Set the raw clustering result (could be array, object, or null)
        setClusteringResult(data.clusters);

        // Check if the result is empty
        const isEmpty =
          !data.clusters ||
          (Array.isArray(data.clusters) && data.clusters.length === 0);

        if (isEmpty) {
          setError("クラスタリング結果が空か、無効です。");
        } else {
          setError(null); // Clear previous errors on success
        }
      },
      (error) => {
        console.error("Clustering error:", error);
        setError(`クラスタリング中にエラーが発生しました: ${error.message}`);
        setClusteringResult(null); // Clear results on error
      }
    );

    setLoading(false);
  };

  const toggleClusterExpansion = (clusterIndex: number) => {
    setExpandedClusters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clusterIndex)) {
        newSet.delete(clusterIndex); // Collapse
      } else {
        newSet.add(clusterIndex); // Expand
      }
      return newSet;
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">クラスタリング</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mb-8">
        <div className="mb-4">
          <label
            htmlFor="itemType"
            className="block text-gray-700 font-medium mb-2"
          >
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
          <label
            htmlFor="method"
            className="block text-gray-700 font-medium mb-2"
          >
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

        {/* N Clusters Input - Only for K-Means */}
        {clusteringParams.method === "kmeans" && (
          <div className="mb-4">
            <label
              htmlFor="n_clusters"
              className="block text-gray-700 font-medium mb-2"
            >
              クラスター数 (K-Means)
            </label>
            <input
              type="number"
              id="n_clusters"
              name="n_clusters"
              value={clusteringParams.params?.n_clusters ?? ""} // Use empty string if undefined
              onChange={handleChange}
              min="2"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 5"
            />
          </div>
        )}

        {/* No parameters needed for Hierarchical */}
        {clusteringParams.method === "hierarchical" && (
          <div className="mb-4 text-sm text-gray-600">
            階層的クラスタリングではパラメータは不要です。
          </div>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "処理中..." : "クラスタリング実行"}
        </Button>
      </form>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      {/* Conditional Rendering based on clustering method and result type */}
      {clusteringResult && (
        <div>
          {/* K-Means Rendering (existing logic, adapted) */}
          {clusteringParams.method === "kmeans" &&
            Array.isArray(clusteringResult) &&
            clusterCount > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  K-Means クラスタリング結果 ({clusterCount}クラスター)
                </h2>
                <div className="space-y-6">
                  {Object.entries(groupedClusters)
                    .sort(
                      ([indexA], [indexB]) => Number(indexA) - Number(indexB)
                    )
                    .map(([clusterIndexStr, items]) => {
                      const clusterIndex = Number(clusterIndexStr);
                      const isExpanded = expandedClusters.has(clusterIndex);
                      const displayItems = isExpanded
                        ? items
                        : items.slice(0, 5);

                      return (
                        <div
                          key={clusterIndex}
                          className="bg-white rounded-lg shadow overflow-hidden"
                        >
                          <div className="bg-blue-50 px-4 py-2 border-b">
                            <h3 className="font-medium">
                              クラスター {clusterIndex}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {items.length}アイテム
                            </p>
                          </div>
                          <div className="divide-y">
                            {displayItems.map((item: ClusteredItem) => (
                              <div key={item.id} className="p-4">
                                <p className="text-gray-800 break-words text-sm">
                                  {item.text && item.text.length > 150
                                    ? `${item.text.substring(0, 150)}...`
                                    : item.text || "（テキスト情報なし）"}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  ID: {item.id}
                                </p>
                              </div>
                            ))}
                          </div>
                          {items.length > 5 && (
                            <div className="p-3 text-center border-t">
                              <Button
                                variant="secondary"
                                onClick={() =>
                                  toggleClusterExpansion(clusterIndex)
                                }
                              >
                                {isExpanded
                                  ? "一部のみ表示"
                                  : `残り${items.length - 5}件を表示`}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

          {/* Hierarchical Rendering (New Logic) */}
          {clusteringParams.method === "hierarchical" &&
            !Array.isArray(clusteringResult) &&
            clusteringResult && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  階層的クラスタリング結果 (ネスト表示)
                </h2>
                <div className="bg-white rounded-lg shadow p-2 overflow-x-auto">
                  {" "}
                  {/* Reduced padding */}
                  {/* Render the hierarchical structure using the updated component */}
                  <HierarchicalClusterView node={clusteringResult} />
                  {/* Removed the unnecessary ul wrapper */}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ThemeClustering;
