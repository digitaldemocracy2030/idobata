import {
  BookOpen,
  HeartHandshake,
  Home,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSiteConfig } from "../../contexts/SiteConfigContext";
import { Button } from "../ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "../ui/sheet";
// ヘッダーの高さ定数
export const HEADER_HEIGHT = 80; // px

// ロゴ画像のパス
const LOGO_PATH = "/images/idobata-logo.svg";

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
    label: "使い方",
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
  const { siteConfig, loading } = useSiteConfig();

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[#2D80FF] bg-white">
      <div className="flex items-center justify-between px-6 py-5 md:px-10 md:py-4">
        {/* 左側：タイトル・ロゴエリア */}
        <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-3">
          <Link
            to="/top"
            className="font-bold text-lg md:text-xl tracking-wider text-[#27272A] leading-none hover:text-[#2D80FF] transition-colors cursor-pointer"
          >
            {loading
              ? "..."
              : siteConfig?.title || "XX党みんなの政策フォーラム"}
          </Link>
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-bold text-[#94B9F9] leading-[2em] tracking-[0.0375em]">
              powered by
            </span>
            <div className="flex items-center gap-0.5">
              <span className="inline-block w-4 h-4 relative">
                <img
                  src={LOGO_PATH}
                  alt="いどばたビジョンロゴ"
                  className="w-full h-full object-contain"
                />
              </span>
              <span className="text-[10px] font-bold text-[#94B9F9] leading-[1em] tracking-[0.03em]">
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
              <Icon className="w-5 h-5 text-[#60A5FA] group-hover:text-[#60A5FA] stroke-[1.67]" />
              <span className="text-[10px] font-bold tracking-wider text-[#27272A]">
                {label}
              </span>
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
            <SheetContent
              side="right"
              className="w-[262.5px] p-0 bg-white"
              style={{ width: "262.5px" }}
            >
              {/* ✕ボタン */}
              <div className="flex justify-end p-6 pb-0">
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="w-10 h-10 p-0 hover:bg-transparent"
                  >
                    <X className="w-8 h-8 stroke-2 text-[#2D80FF]" />
                  </Button>
                </SheetClose>
              </div>

              {/* メニュー項目 */}
              <nav className="flex flex-col gap-6 px-6 mt-12">
                {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
                  <SheetClose key={label} asChild>
                    <Link
                      to={to}
                      className="flex items-center gap-3 text-base font-bold tracking-[0.025em] text-[#27272A] hover:text-[#2D80FF] leading-8"
                    >
                      <Icon className="w-8 h-8 stroke-2 text-[#60A5FA]" />
                      {label}
                    </Link>
                  </SheetClose>
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
