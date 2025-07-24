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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetOverlay,
  SheetTrigger,
} from "../ui/sheet";

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
  const { siteConfig, loading } = useSiteConfig();

  return (
    <header className="w-full border-b-2 border-[#EEEEEE] bg-white">
      <div className="flex items-center justify-between px-6 py-5 md:px-10 md:py-4">
        {/* 左側：タイトル・ロゴエリア */}
        <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-3">
          <span className="font-bold text-lg md:text-xl tracking-wider text-[#27272A] leading-none">
            {loading ? "..." : siteConfig?.title || "りっけん対話アリーナ"}
          </span>
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
              <Icon className="w-5 h-5 text-[#60A5FA] group-hover:text-[#60A5FA] transition-colors stroke-[1.67]" />
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
                className="w-8 h-8 p-0 hover:bg-transparent group"
              >
                <Menu className="w-8 h-8 stroke-[1.8] text-[#2D80FF]" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="fixed inset-y-0 right-0 h-full w-[262.5px] p-6 bg-white z-50 shadow-none data-[state=open]:animate-[slideInFromRight_300ms_ease-out_forwards] data-[state=closed]:animate-[slideOutToRight_300ms_ease-out_forwards]"
            >
              <SheetClose className="absolute right-6 top-6 rounded-sm opacity-100 hover:opacity-70 focus:outline-none disabled:pointer-events-none group">
                <X className="h-8 w-8 text-[#2D80FF] stroke-[1.8]" />
                <span className="sr-only">Close</span>
              </SheetClose>
              <nav className="flex flex-col gap-6 mt-[80px]">
                {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className="flex items-center gap-3 font-bold tracking-[0.025em] text-[#27272A] hover:text-[#60A5FA] transition-colors"
                  >
                    <Icon className="w-8 h-8 text-[#60A5FA] stroke-[1.8]" />
                    <span className="text-base leading-[2em]">{label}</span>
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
