import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

const HeroSection = () => {
  return (
    <div className="relative bg-white py-6">
      <div className="px-4">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            あなたの声から、
            <br />
            政策が動き出す
          </h1>
          <p className="text-sm text-neutral-600 mb-4">
            社会をもっと良くするヒントは、あなたの実感にあります。
          </p>

          {/* ハッシュタグイメージ */}
          <div className="relative w-full h-40 bg-gradient-to-br from-purple-400 to-cyan-300 mb-4 rounded-lg flex items-center justify-center">
            <span className="text-white text-5xl font-bold">#</span>

            {/* 吹き出しアイコン */}
            <div className="absolute top-4 right-4">
              <MessageSquare className="h-6 w-6 text-purple-200" />
            </div>
            <div className="absolute bottom-8 left-4">
              <MessageSquare className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="absolute top-1/2 right-8">
              <MessageSquare className="h-8 w-8 text-purple-100" />
            </div>
          </div>

          <p className="text-xs text-neutral-600 mb-4">
            今、全国で寄せられている声と、動き出した政策案をご覧ください。
          </p>

          <div className="text-center">
            <Button
              asChild
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full"
            >
              <Link to="/about" className="flex items-center">
                このサイトについて
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>このサイトについて</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
