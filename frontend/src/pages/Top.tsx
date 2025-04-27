import React from 'react';
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/home/HeroSection";
import SectionTitle from "../components/home/SectionTitle";
import DiscussionCard from "../components/home/DiscussionCard";
import ThemeCard from "../components/home/ThemeCard";
import SeeMoreButton from "../components/home/SeeMoreButton";

const Top = () => {
  const discussionData = [
    { id: 1, title: "教育格差の是正", problemCount: 12, solutionCount: 34 },
    { id: 2, title: "エネルギー政策の未来", problemCount: 8, solutionCount: 20 },
  ];

  const themeData = [
    { id: 1, title: "子育て支援の拡充", problemCount: 5, solutionCount: 10 },
    { id: 2, title: "防災とまちづくり", problemCount: 3, solutionCount: 7 },
  ];

  return (
    <div className="min-h-screen flex flex-col pt-16"> {/* Header分のpaddingを追加 */}
      <Header />
      
      <main className="flex-grow">
        <HeroSection />
        
        <div className="container mx-auto px-4 py-8">
          <section className="mb-10">
            <SectionTitle title="人気の重要論点" />
            <div className="space-y-4">
              {discussionData.map((item) => (
                <DiscussionCard 
                  key={item.id}
                  title={item.title}
                  problemCount={item.problemCount}
                  solutionCount={item.solutionCount}
                />
              ))}
            </div>
            <SeeMoreButton />
          </section>
          
          <section className="mb-10">
            <SectionTitle title="意見募集中テーマ" />
            <div className="space-y-4">
              {themeData.map((item) => (
                <ThemeCard 
                  key={item.id}
                  title={item.title}
                  problemCount={item.problemCount}
                  solutionCount={item.solutionCount}
                />
              ))}
            </div>
            <SeeMoreButton />
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Top;
