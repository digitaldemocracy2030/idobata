import useNavigatorStore from "../../../store/navigatorStore";

export function useDirectoryNavigation() {
  const {
    treeData,
    expandedPaths,
    loadingPaths,
    toggleExpanded,
    loadDirectory,
    initializeRoot,
  } = useNavigatorStore();

  return {
    treeData,
    expandedPaths,
    loadingPaths,
    toggleExpanded,
    loadDirectory,
    initializeRoot,
  };
}

export default useNavigatorStore;
