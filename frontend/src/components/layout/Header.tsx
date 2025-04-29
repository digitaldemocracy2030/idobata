import { Menu, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../services/api/apiClient";
import type { Theme } from "../../types";
import { Button } from "../ui/button";
import {
  NavigationRouterLink,
  NavigationSheet,
  NavigationSheetContent,
  NavigationSheetTrigger,
} from "../ui/navigation/menu-sheet";

const Header = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThemes = async () => {
      setIsLoading(true);
      setError(null);

      const result = await apiClient.getAllThemes();

      if (!result.isOk()) {
        setError(`テーマの取得に失敗しました: ${result.error.message}`);
        console.error("Error fetching themes:", result.error);
        setIsLoading(false);
        return;
      }

      setThemes(result.value);
      setIsLoading(false);
    };

    fetchThemes();
  }, []);
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-purple-200 py-3 px-4">
      <div className="flex justify-between items-center">
        {/* ハンバーガーメニュー（左） */}
        <NavigationSheet>
          <NavigationSheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </NavigationSheetTrigger>
          <NavigationSheetContent className="w-72">
            <nav className="flex flex-col gap-4 mt-8">
              <NavigationRouterLink
                to="/"
                className="text-lg py-2 px-4 hover:bg-purple-50 rounded-md border-l-4 border-purple-500"
              >
                TOP
              </NavigationRouterLink>
              <NavigationRouterLink
                to="/about"
                className="text-lg py-2 px-4 hover:bg-purple-50 rounded-md"
              >
                このサイトについて
              </NavigationRouterLink>
              <NavigationRouterLink
                to="/mypage"
                className="text-lg py-2 px-4 hover:bg-purple-50 rounded-md"
              >
                マイページ
              </NavigationRouterLink>

              <div className="mt-4 mb-2">
                <h3 className="text-lg font-semibold px-4">テーマ一覧</h3>
              </div>

              {isLoading && (
                <div className="px-4 py-2 text-sm text-gray-500">
                  読み込み中...
                </div>
              )}

              {error && (
                <div className="px-4 py-2 text-sm text-red-500">{error}</div>
              )}

              {!isLoading && !error && themes.length === 0 && (
                <div className="px-4 py-2 text-sm text-gray-500">
                  テーマがありません
                </div>
              )}

              {!isLoading &&
                !error &&
                themes.map((theme) => (
                  <NavigationRouterLink
                    key={theme._id}
                    to={`/themes/${theme._id}`}
                    className="text-sm py-2 px-4 hover:bg-purple-50 rounded-md"
                  >
                    {theme.title}
                  </NavigationRouterLink>
                ))}
            </nav>
          </NavigationSheetContent>
        </NavigationSheet>

        {/* サイトタイトル（中央） */}
        <Link to="/top">
          <h1 className="text-base font-semibold text-center">
            XX党 みんなの政策フォーラム
          </h1>
        </Link>

        {/* マイページアイコン（右） */}
        <Link to="/mypage">
          <Button variant="ghost" size="icon">
            <User className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
