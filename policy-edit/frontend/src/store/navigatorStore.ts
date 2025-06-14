import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  NavigatorState,
  TreeNodeData,
} from "../features/navigation/types/navigation";
import type { GitHubDirectoryItem } from "../lib/github";
import useContentStore from "./contentStore";

const useNavigatorStore = create<NavigatorState>()(
  devtools(
    (set, get) => ({
      treeData: [],
      expandedPaths: new Set<string>(),
      loadingPaths: new Set<string>(),

      toggleExpanded: async (path: string) => {
        const { expandedPaths, loadDirectory } = get();
        const newExpandedPaths = new Set(expandedPaths);

        if (expandedPaths.has(path)) {
          newExpandedPaths.delete(path);
        } else {
          newExpandedPaths.add(path);
          await loadDirectory(path);
        }

        set({ expandedPaths: newExpandedPaths });
      },

      loadDirectory: async (path: string) => {
        const { loadingPaths } = get();
        if (loadingPaths.has(path)) return;

        const newLoadingPaths = new Set(loadingPaths);
        newLoadingPaths.add(path);
        set({ loadingPaths: newLoadingPaths });

        try {
          const contentStore = useContentStore.getState();
          await contentStore.fetchContent(path);

          // fetchContent後の状態を再取得
          const updatedContentStore = useContentStore.getState();
          const content = updatedContentStore.content;
          if (Array.isArray(content)) {
            set((state) => ({
              treeData: updateTreeData(state.treeData, path, content),
              loadingPaths: new Set(
                [...state.loadingPaths].filter((p) => p !== path)
              ),
            }));
          }
        } catch (error) {
          console.error(`Failed to load directory: ${path}`, error);
          set((state) => ({
            loadingPaths: new Set(
              [...state.loadingPaths].filter((p) => p !== path)
            ),
          }));
        }
      },

      initializeRoot: async () => {
        const { loadDirectory } = get();
        await loadDirectory("");
      },
    }),
    {
      name: "navigator-store",
    }
  )
);

function updateTreeData(
  treeData: TreeNodeData[],
  targetPath: string,
  newChildren: GitHubDirectoryItem[]
): TreeNodeData[] {
  if (targetPath === "") {
    const mappedChildren: TreeNodeData[] = newChildren
      .filter((item) => !item.name.startsWith('.'))
      .map((item) => ({
        name: item.name,
        path: item.path,
        type: (item.type === "dir" ? "dir" : "file") as "file" | "dir",
        children: item.type === "dir" ? [] : undefined,
        isExpanded: false,
        isLoaded: item.type === "file",
      }));

    // ファイルを上に、フォルダーを下にソート
    return mappedChildren.sort((a, b) => {
      if (a.type === "file" && b.type === "dir") return -1;
      if (a.type === "dir" && b.type === "file") return 1;
      return a.name.localeCompare(b.name);
    });
  }

  return treeData.map((node) => {
    if (node.path === targetPath && node.type === "dir") {
      const mappedChildren: TreeNodeData[] = newChildren
        .filter((item) => !item.name.startsWith('.'))
        .map((item) => ({
          name: item.name,
          path: item.path,
          type: (item.type === "dir" ? "dir" : "file") as "file" | "dir",
          children: item.type === "dir" ? [] : undefined,
          isExpanded: false,
          isLoaded: item.type === "file",
        }));

      // ファイルを上に、フォルダーを下にソート
      const sortedChildren = mappedChildren.sort((a, b) => {
        if (a.type === "file" && b.type === "dir") return -1;
        if (a.type === "dir" && b.type === "file") return 1;
        return a.name.localeCompare(b.name);
      });

      return {
        ...node,
        children: sortedChildren,
        isLoaded: true,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, targetPath, newChildren),
      };
    }
    return node;
  });
}

export default useNavigatorStore;
