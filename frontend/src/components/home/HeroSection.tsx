import { ArrowRight } from "lucide-react";

// Mock components for demonstration
const Button = ({ children, asChild, size, className = "" }) => {
  if (asChild) {
    return children;
  }
  return (
    <button 
      type="button"
      className={`inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg ${className}`}
    >
      {children}
    </button>
  );
};

const Link = ({ to, children, className = "" }) => (
  <a href={to} className={`inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg ${className}`}>
    {children}
  </a>
);

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-white py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto gap-8 lg:gap-12">
          
          {/* 左側コンテンツ */}
          <div className="flex-1 text-center lg:text-left">
            {/* メインタイトル */}
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              語り合う勇気が、
              <br className="hidden sm:block" />
              <span className="text-blue-600">政治を動かす</span>
            </h1>
            
            {/* モバイル用画像 */}
            <div className="block lg:hidden mb-8">
              <div className="relative w-48 h-48 mx-auto">
                <img
                  src="/api/placeholder/300/300"
                  alt="野田さんのメインイメージ"
                  className="w-full h-full object-cover rounded-full shadow-lg"
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
              
              <p className="text-lg text-gray-600 mb-2 leading-relaxed">
                難しい話？ いいえ、あなたの声がスタート地点。
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                あなたの声が、これからの政治を<span className="font-semibold text-blue-600">つ・く・る</span>。
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
              <div className="absolute inset-0 bg-blue-200 rounded-full transform rotate-6 scale-105" />
              <img
                src="/api/placeholder/400/500"
                alt="野田さんのメインイメージ"
                className="relative w-80 h-96 object-cover rounded-lg shadow-2xl"
              />
            </div>
          </div>
          
        </div>
      </div>
      
      {/* 背景装飾 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full opacity-30 translate-y-24 -translate-x-24" />
    </div>
  );
};

export default HeroSection;