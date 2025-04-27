import React from 'react';
import { Menu, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-neutral-200 py-3 px-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* ハンバーガーメニュー（左） */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="flex flex-col gap-4 mt-8">
              <Link to="/top" className="text-lg py-2 px-4 hover:bg-neutral-100 rounded-md">ホーム</Link>
              <Link to="/about" className="text-lg py-2 px-4 hover:bg-neutral-100 rounded-md">このサイトについて</Link>
              <Link to="/mypage" className="text-lg py-2 px-4 hover:bg-neutral-100 rounded-md">マイページ</Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* サイトタイトル（中央） */}
        <h1 className="text-xl font-semibold text-center">XX党 みんなの政策フォーラム</h1>

        {/* マイページアイコン（右） */}
        <Button variant="ghost" size="icon" asChild>
          <Link to="/mypage">
            <User className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default Header;
