import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import useNavigatorStore from "../../../store/navigatorStore";
import type { TreeNodeData } from "../types/navigation";

interface TreeNodeProps {
  node: TreeNodeData;
  level: number;
}

function TreeNode({ node, level }: TreeNodeProps) {
  const { expandedPaths, loadingPaths, toggleExpanded } = useNavigatorStore();

  const isExpanded = expandedPaths.has(node.path);
  const isLoading = loadingPaths.has(node.path);
  const hasChildren = node.children && node.children.length > 0;

  const handleFolderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (node.type === "dir") {
      toggleExpanded(node.path);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (node.type === "dir") {
        toggleExpanded(node.path);
      }
    }
  };

  const indentStyle = {
    paddingLeft: `${level * 16 + 8}px`,
  };

  if (node.type === "file") {
    return (
      <div>
        <Link
          to={`/view/${node.path}`}
          className="flex items-center py-1 px-2 hover:bg-gray-100 text-sm text-gray-700 hover:text-gray-900 transition-colors"
          style={indentStyle}
        >
          <FileText className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
          <span className="truncate">
            {node.name.endsWith(".md") ? node.name.slice(0, -3) : node.name}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        className="flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 hover:text-gray-900 transition-colors w-full text-left border-none bg-transparent"
        style={indentStyle}
        onClick={handleFolderClick}
        onKeyDown={handleKeyDown}
        type="button"
      >
        <div className="w-4 h-4 mr-1 flex items-center justify-center flex-shrink-0">
          {isLoading ? (
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : hasChildren || !node.isLoaded ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : null}
        </div>
        <Folder className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
        <span className="truncate">{node.name}</span>
      </button>

      {isExpanded && hasChildren && (
        <div>
          {node.children?.map((child) => (
            <TreeNode key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TreeNode;
