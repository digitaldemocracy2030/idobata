import { Link } from "react-router-dom";
import { Button } from "../ui/button";

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

          {/* メインイメージ */}
          <div className="relative w-full mb-4 rounded-lg overflow-hidden">
            <img
              src="/images/MainImage.png"
              alt="いどばたのメインイメージ"
              className="w-full h-auto"
            />
          </div>

          <p className="text-sm text-neutral-600">
            社会をもっと良くするヒントは、あなたの実感にあります。
          </p>
          <p className="text-sm text-neutral-600 mb-4">
            今、全国で寄せられている声と、動き出した政策案をご覧ください。
          </p>

          <div className="text-center">
            <Button
              asChild
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full"
            >
              <Link to="/about" className="flex items-center justify-center">
                このサイトについて
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
