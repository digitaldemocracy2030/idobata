import SeeMoreButton from "./SeeMoreButton";

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

          <div className="flex justify-start">
            <SeeMoreButton to="/about" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
