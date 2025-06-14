import { useEffect } from "react";
import useNavigatorStore from "../../../store/navigatorStore";
import TreeNode from "./TreeNode";

function DirectoryNavigator() {
  const { treeData, initializeRoot } = useNavigatorStore();

  useEffect(() => {
    initializeRoot();
  }, [initializeRoot]);

  return (
    <div className="w-full">
      <div className="max-h-96 overflow-y-auto">
        {treeData.length === 0 ? (
          <div className="px-2 py-4 text-sm text-gray-500 text-center">
            読み込み中...
          </div>
        ) : (
          <div>
            {treeData.map((node) => (
              <TreeNode key={node.path} node={node} level={0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DirectoryNavigator;
