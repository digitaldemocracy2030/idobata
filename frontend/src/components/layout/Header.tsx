import { Menu, User } from 'lucide-react';
import {
  NavigationSheet,
  NavigationSheetContent,
  NavigationSheetTrigger,
} from '../ui/navigation/menu-sheet';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

const Header = () => {
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
              <Link
                to="/"
                className="text-lg py-2 px-4 hover:bg-purple-50 rounded-md border-l-4 border-purple-500"
              >
                ホーム
              </Link>
              <Link to="/about" className="text-lg py-2 px-4 hover:bg-purple-50 rounded-md">
                このサイトについて
              </Link>
              <Link to="/mypage" className="text-lg py-2 px-4 hover:bg-purple-50 rounded-md">
                マイページ
              </Link>
            </nav>
          </NavigationSheetContent>
        </NavigationSheet>

        {/* サイトタイトル（中央） */}
        <Link to="/top">
          <h1 className="text-base font-semibold text-center">XX党 みんなの政策フォーラム</h1>
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
