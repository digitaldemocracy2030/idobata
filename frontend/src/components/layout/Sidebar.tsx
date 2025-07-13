import { Link } from "../../contexts/MockContext";
import { useThemes } from "../../hooks/useThemes";

const Sidebar = () => {
  const { themes, isLoading, error } = useThemes();

  return (
    <aside className="hidden xl:block w-[260px] fixed top-24 bottom-0 left-0 shadow-md  bg-white overflow-y-auto">
      <nav className="flex flex-col gap-4 p-4">
        <Link
          to="/"
          className="text-base py-1 px-2 hover:bg-primary-50 rounded-md"
        >
          TOP
        </Link>
        <Link
          to="/manual"
          className="text-base py-1 px-2 hover:bg-primary-50 rounded-md"
        >
          使い方
        </Link>
        <Link
          to="/about"
          className="text-base py-1 px-2 hover:bg-primary-50 rounded-md"
        >
          このサイトについて
        </Link>
        <Link
          to="/mypage"
          className="text-base py-1 px-2 hover:bg-primary-50 rounded-md"
        >
          マイページ
        </Link>

        {isLoading && (
          <div className="px-4 py-2 text-sm text-gray-500">読み込み中...</div>
        )}

        {error && <div className="px-4 py-2 text-sm text-red-500">{error}</div>}

        {!isLoading && !error && themes.length === 0 && (
          <div className="px-4 py-2 text-sm text-gray-500">
            テーマがありません
          </div>
        )}

        {themes.length > 0 && !isLoading && !error && (
          <div className="py-2">
            <h3 className="text-base text-gray-500 px-4">
              議論をお願いしているテーマ一覧
            </h3>

            <div className="flex flex-col mt-2">
              {themes.map((theme) => (
                <Link
                  key={theme._id}
                  to={`/themes/${theme._id}`}
                  className="text-base py-2 hover:bg-primary-50 rounded-md ml-8"
                >
                  {theme.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {process.env.NODE_ENV === "development" && (
          <div className="flex mt-4 px-4">
            <button
              type="button"
              onClick={() => {
                const currentParams = new URLSearchParams(
                  window.location.search
                );
                let targetPathname = window.location.pathname;
                let targetSearch = "";

                if (currentParams.has("mock")) {
                  targetPathname = "/";
                  currentParams.delete("mock");
                  targetSearch = currentParams.toString();
                } else {
                  currentParams.set("mock", "true");
                  targetSearch = currentParams.toString();
                }

                window.location.href = `${targetPathname}${
                  targetSearch ? `?${targetSearch}` : ""
                }`;
              }}
              className="text-xs px-2 py-1 rounded-md border border-neutral-300 bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            >
              {/* {window.location.search.includes("mock=true")
                ? "モックモードを解除しトップへ"
                : "モックモードに入る（開発用）"} */}
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
