import DiscussionCard from "../components/home/DiscussionCard";
import HeroSection from "../components/home/HeroSection";
import SectionTitle from "../components/home/SectionTitle";
import SeeMoreButton from "../components/home/SeeMoreButton";
import ThemeCard from "../components/home/ThemeCard";

const Top = () => {
  const discussionData = [
    {
      id: 1,
      title: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      problemCount: 99,
      solutionCount: 99,
    },
    {
      id: 2,
      title: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      problemCount: 99,
      solutionCount: 99,
    },
    {
      id: 3,
      title: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      problemCount: 99,
      solutionCount: 99,
    },
  ];

  const themeData = [
    {
      id: "1",
      title: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      problemCount: 99,
      solutionCount: 99,
    },
    {
      id: "2",
      title: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      problemCount: 99,
      solutionCount: 99,
    },
    {
      id: "3",
      title: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      problemCount: 99,
      solutionCount: 99,
    },
  ];

  return (
    <>
      <HeroSection />

      <div className="py-4">
        <section className="mb-6 bg-purple-200/70 rounded-3xl p-3">
          <SectionTitle title="人気の重要論点" />
          <p className="text-xs text-neutral-600 mb-3">
            いま最も注目が集まっている論点はこちらです。中身を見てみましょう。
          </p>
          <div className="space-y-4">
            {discussionData.map((item) => (
              <DiscussionCard
                key={item.id}
                id={item.id}
                title={item.title}
                problemCount={item.problemCount}
                solutionCount={item.solutionCount}
              />
            ))}
          </div>
          <SeeMoreButton to="/" />
        </section>

        <div className="py-4"></div>
        <section className="mb-6 bg-purple-200/70 rounded-3xl p-3">
          <SectionTitle title="意見募集中テーマ" />
          <p className="text-xs text-neutral-600 mb-3">
            今募集されているテーマはこちらです。気軽にご意見を教えてください！
          </p>
          <div className="space-y-4">
            {themeData.map((item) => (
              <ThemeCard
                key={item.id}
                id={item.id}
                title={item.title}
                problemCount={item.problemCount}
                solutionCount={item.solutionCount}
              />
            ))}
          </div>
          <SeeMoreButton to="/themes" />
        </section>
      </div>
    </>
  );
};

export default Top;
