import React from "react";
import { Menu, Home, HeartHandshake, BookOpen, UserRound } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Link, useLocation } from "react-router-dom";

// ロゴ画像のパス
const LOGO_PATH = "/images/MainImage.png";

const NAV_ITEMS = [
  {
    label: "トップ",
    icon: Home,
    to: "/top",
  },
  {
    label: "はじめに",
    icon: HeartHandshake,
    to: "/about",
  },
  {
    label: "使いかた",
    icon: BookOpen,
    to: "/howto",
  },
  {
    label: "マイページ",
    icon: UserRound,
    to: "/mypage",
  },
];

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="w-full border-b-2 border-[#2D80FF] bg-white">
      <div className="flex items-center justify-between px-6 py-5 md:px-10 md:py-4">
        {/* 左側：タイトル・ロゴエリア */}
        <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-3">
          <span className="font-bold text-lg md:text-xl tracking-wider text-[#27272A] leading-none">
            りっけん対話アリーナ
          </span>
          <div className="flex items-end gap-1">
            <span className="text-[8px] font-bold text-[#94B9F9] leading-4 tracking-wider md:mb-1">
              powered by
            </span>
            <div className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 relative">
                <img
                  src={LOGO_PATH}
                  alt="いどばたビジョンロゴ"
                  className="w-full h-full object-contain"
                />
              </span>
              <span className="text-[10px] font-bold text-[#94B9F9] tracking-wider">
                いどばたビジョン
              </span>
            </div>
          </div>
        </div>

        {/* PCナビゲーション */}
        <nav className="hidden md:flex gap-3">
          {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
            <Link
              key={label}
              to={to}
              className={`flex flex-col items-center gap-1 group w-[58px] ${
                location.pathname === to ? "text-[#27272A]" : "text-[#27272A]"
              }`}
            >
              <Icon className="w-5 h-5 text-[#60A5FA] group-hover:text-[#60A5FA] transition-colors stroke-[1.67]" />
              <span className="text-[10px] font-bold tracking-wider text-[#27272A]">{label}</span>
            </Link>
          ))}
        </nav>

        {/* スマホ：ハンバーガーメニュー */}
        <div className="md:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="w-8 h-8 p-0 hover:bg-transparent"
              >
                <Menu className="w-8 h-8 stroke-2 text-[#2D80FF]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-0">
              <nav className="flex flex-col gap-6 mt-8 px-6">
                {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className="flex items-center gap-3 text-base font-bold tracking-wider text-[#27272A] hover:text-[#2D80FF] transition-colors"
                  >
                    <Icon className="w-6 h-6" />
                    {label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
