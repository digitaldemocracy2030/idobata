import BreadcrumbView from "../../components/common/BreadcrumbView";
import DiscussionCard from "../../components/home/DiscussionCard";
import HeroSection from "../../components/home/HeroSection";
import SeeMoreButton from "../../components/home/SeeMoreButton";
import ThemeCard from "../../components/home/ThemeCard";
import { Section } from "../../components/ui/section";

export interface TopPageTemplateProps {
  discussions: {
    id: number | string;
    title: string;
    problemCount: number;
    solutionCount: number;
  }[];
  themes: {
    id: string;
    title: string;
    problemCount: number;
    solutionCount: number;
  }[];
}

const TopPageTemplate = ({ discussions, themes }: TopPageTemplateProps) => {
  const breadcrumbItems = [{ label: "TOP", href: "/" }];

  return (
    <div className="container mx-auto py-8">
      <div className="px-4">
        <BreadcrumbView items={breadcrumbItems} />
      </div>

      <div className="flex flex-col gap-16">
        <HeroSection />
        <Section
          title="人気の重要論点"
          description="いま最も注目が集まっている論点はこちらです。中身を見てみましょう。"
          className="mb-6 bg-[#EADFFF] rounded-3xl"
        >
          <div className="space-y-4">
            {discussions.map((item) => (
              <DiscussionCard
                key={item.id}
                id={item.id}
                title={item.title}
                problemCount={item.problemCount}
                solutionCount={item.solutionCount}
              />
            ))}
          </div>
          <div className="flex justify-start">
            <SeeMoreButton to="/" />
          </div>
        </Section>

        <Section
          title="意見募集中テーマ"
          description="今募集されているテーマはこちらです。気軽にご意見を教えてください！"
          className="mb-6 bg-[#EADFFF] rounded-3xl"
        >
          <div className="space-y-4">
            {themes.map((item) => (
              <ThemeCard
                key={item.id}
                id={item.id}
                title={item.title}
                problemCount={item.problemCount}
                solutionCount={item.solutionCount}
              />
            ))}
          </div>
          <div className="flex justify-start">
            <SeeMoreButton to="/themes" />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default TopPageTemplate;
