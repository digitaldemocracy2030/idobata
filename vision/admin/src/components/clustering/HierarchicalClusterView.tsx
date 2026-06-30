import React from "react";
import type { FC } from "react";
import type { HierarchicalClusterNode } from "../../services/api/types";

interface HierarchicalClusterViewProps {
  node: HierarchicalClusterNode;
}

const HierarchicalClusterView: FC<HierarchicalClusterViewProps> = ({
  node,
}) => {
  // Render leaf node (item)
  if (node.is_leaf) {
    return (
      <div className="p-1 border border-green-200 bg-green-50 rounded mb-1">
        {/* Make ID smaller and less prominent */}
        <span className="text-xs text-gray-500">ID: {node.id}</span>
        <p className="text-xs text-gray-600 mt-0.5 break-words">
          {/* Display full text, remove truncation */}
          {node.text || "(テキストなし)"}
        </p>
      </div>
    );
  }

  // Render cluster node (nested box)
  return (
    <div className="border border-blue-300 bg-blue-50 rounded p-1 mb-1">
      {/* Make Cluster info smaller */}
      <span className="text-xs font-medium text-blue-700">
        Cluster ({node.count} items)
      </span>
      {/* Optional: Display distance if available */}
      {/* <span className="text-xs text-gray-500 ml-2">Dist: {node.distance?.toFixed(4)}</span> */}
      <div className="mt-1 pl-1">
        {" "}
        {/* Slightly indent children */}
        {node.children?.map((child, index) => (
          <HierarchicalClusterView
            key={`${index}-${child.count}`}
            node={child}
          />
        ))}
      </div>
    </div>
  );
};

export default HierarchicalClusterView;
