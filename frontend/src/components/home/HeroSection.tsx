import { ArrowRight } from "lucide-react";
import { Link } from "../../contexts/MockContext";
import { Button } from "../ui/button";

const HeroSection = () => {
  return (
    <div className="relative bg-background py-6">
      <div className="px-4">
        <div className="flex flex-col md:flex-row items-stretch justify-between max-w-4xl mx-auto">
          {/* 左側（テキスト） */}
          <div className="flex flex-col flex-1 min-w-0 md:mr-8">
            {/* タイトル（SPでは一番上） */}
            <h1 className="text-3xl text-foreground mb-2">
              語り合う勇気が、
              <span className="inline md:hidden"><br /></span>
              政治を動かす
            </h1>
            {/* SPではここで画像を表示 */}
            <div className="block md:hidden w-full max-w-xs mx-auto mb-4">
              <img
                src="/images/noda.jpg"
                alt="野田さんのメインイメージ"
                className="w-full h-auto rounded-lg"
              />
            </div>
            {/* 残りのテキスト・ボタン */}
            <div className="flex flex-col justify-between flex-1">
              <div>
              　<h4 className="text-xl text-foreground mb-2">AIがつなぐ</h4>
                <h2 className="text-xl text-foreground mb-2">
                　　 りっけん対話アリーナ
                </h2>
                <p className="text-base text-muted-foreground">
                  難しい話？ いいえ、あなたの声がスタート地点。
                </p>
                <p className="text-base text-muted-foreground mb-4">
                  　あなたの声が、これからの政治をつ・く・る。
                </p>
                <h1 className="text-3xl text-foreground mb-2">
                  そのモヤモヤ、言葉にしよう！
                </h1>
                <h3 className="text-2xl text-foreground mb-2">
                  声を出せ。話せ。届け。
                </h3>
                <p className="text-base text-muted-foreground">
                  立憲民主党 AI大規模熟議システム
                </p>
                <p className="text-base text-muted-foreground mb-4">
                 #対話アリーナ へようこそ!!
                </p>
              </div>
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link to="/about">
                    このサイトについて
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          {/* 画像（PCのみ右側に表示） */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <img
              src="/images/noda.jpg"
              alt="野田さんのメインイメージ"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
