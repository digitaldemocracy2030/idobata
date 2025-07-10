import { ArrowRight } from "lucide-react";
import { Link } from "../../contexts/MockContext";
import { Button } from "../ui/button";

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-white py-10 lg:py-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto gap-8 lg:gap-6">
          {/* 左側コンテンツ */}
          <div className="flex-1 text-center lg:text-left">
            {/* メインタイトル */}
            <h1
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-snug"
              style={{
                lineHeight: window.innerWidth < 640 ? "0.7" : undefined,
              }}
            >
              <span className="block sm:inline">語り合う勇気が</span>
              <span className="hidden sm:inline">、</span>
              <br className="sm:hidden" />
              <span className="text-blue-600">政治を動かす</span>
            </h1>
            {/* モバイル用画像 */}
            <div className="block lg:hidden mb-8">
              <div className="relative w-48 h-48 mx-auto">
                <img
                  src="/images/noda.jpg"
                  alt="野田さんのメインイメージ"
                  className="w-full h-full object-cover object-top rounded-full shadow-lg"
                />
              </div>
            </div>
            {/* サブタイトルとキャッチフレーズ */}
            <div className="mb-8">
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
                AIがつなぐ
              </div>
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 mb-4">
                りっけん対話アリーナ
              </h2>
              <p className="text-xl text-gray-600 mb-2 leading-relaxed">
                難しい話？ いいえ、あなたの声がスタート地点。
              </p>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                あなたの声が、これからの政治を
                <span className="font-semibold text-blue-600">つ・く・る</span>
                。
              </p>
            </div>
            {/* 行動を促すセクション */}
            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500 mb-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                そのモヤモヤ、言葉にしよう！
              </h3>
              <h4 className="text-xl lg:text-2xl font-semibold text-blue-600 mb-4">
                声を出せ。話せ。届け。
              </h4>
            </div>
            {/* フッター情報 */}
            <div className="text-center lg:text-left mb-8">
              <p className="text-sm text-gray-500 mb-1">
                立憲民主党 AI大規模熟議システム
              </p>
              <p className="text-lg font-medium text-blue-600">
                #対話アリーナ へようこそ!!
              </p>
            </div>
            {/* CTA ボタン */}
            <div className="flex justify-center lg:justify-start">
              <Button asChild size="lg">
                <Link to="/about">
                  このサイトについて
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
          {/* 右側画像（デスクトップのみ） */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-full transform rotate-6 scale-105" />
              <img
                src="/images/noda.jpg"
                alt="野田さんのメインイメージ"
                className="relative w-80 h-120 object-cover rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
