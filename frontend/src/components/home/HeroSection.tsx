import { ArrowRight } from "lucide-react";
import { Link } from "../../contexts/MockContext";
import { Button } from "../ui/button";

const HeroSection = () => {
  return (
    <div className="relative bg-background py-6">
      <div className="px-4">
        <div className="text-left">
          <h1 className="text-3xl text-foreground mb-2">
            語り合う勇気が、政治を動かす
          </h1>

          {/* メインイメージ */}
          <div className="relative w-full max-w-sm mx-auto mb-4 rounded-lg overflow-hidden"></div>

          <p className="text-base text-muted-foreground">
            難しい話？ いいえ、あなたの声がスタート地点。
          </p>
          <p className="text-base text-muted-foreground mb-4">
            　あなたの声が、これからの政治をつ・く・る。
          </p>

          <h1 className="text-3xl text-foreground mb-2">
            そのモヤモヤ、言葉にしよう！
          </h1>

          <p className="text-base text-muted-foreground">
            声を出せ。話せ。届け。
          </p>
          <p className="text-base text-muted-foreground mb-4">
            立憲民主党 AI大規模熟議システム #対話アリーナ へようこそ！
          </p>

          <div className="flex justify-start">
            <div className="text-center mt-4">
              <Button asChild size="lg">
                <Link to="/about">
                  このサイトについて
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
