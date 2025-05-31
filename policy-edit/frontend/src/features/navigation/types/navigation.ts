export interface TreeNodeData {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: TreeNodeData[];
  isExpanded?: boolean;
  isLoaded?: boolean;
}

export interface NavigatorState {
  treeData: TreeNodeData[];
  expandedPaths: Set<string>;
  loadingPaths: Set<string>;
  toggleExpanded: (path: string) => void;
  loadDirectory: (path: string) => Promise<void>;
  initializeRoot: () => Promise<void>;
}
