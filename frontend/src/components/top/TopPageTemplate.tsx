import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import BreadcrumbView from "../../components/common/BreadcrumbView";
import DiscussionCard from "../../components/home/DiscussionCard";
import HeroSection from "../../components/home/HeroSection";
import ThemeCard from "../../components/home/ThemeCard";
import { Section } from "../../components/ui/section";
import { useTheme } from "../../contexts/ThemeContext";
import { Button } from "../ui/button";

export interface TopPageTemplateProps {
  discussions: {
    id: number | string;
    title: string;
    problemCount: number;
    solutionCount: number;
    likeCount: number;
  }[];
  themes: {
    id: string;
    title: string;
    description: string;
    keyQuestionCount: number;
    commentCount: number;
  }[];
}

const TopPageTemplate = ({ discussions, themes }: TopPageTemplateProps) => {
  const { defaultThemeId } = useTheme();
  const breadcrumbItems = [{ label: "TOP", href: "/" }];

  return (
    <div className="container mx-auto py-8 xl:max-w-none">
      <div className="px-4">
        <BreadcrumbView items={breadcrumbItems} />
      </div>

      <div className="flex flex-col gap-16  ">
        <HeroSection />
        <Section
          title="今まさにホットトピック"
          description="いま最も注目が集まっている論点はこちらです。中身を見てみましょう。"
          className="mb-6 bg-primary-weak rounded-3xl p-4 sm:p-8"
        >
          <div className="space-y-4">
            {discussions.map((item) => (
              <DiscussionCard
                key={item.id}
                id={item.id}
                title={item.title}
                problemCount={item.problemCount}
                solutionCount={item.solutionCount}
                likeCount={item.likeCount}
                themeId={defaultThemeId || undefined}
              />
            ))}
          </div>
          {/* 実は論点の一覧ページは存在していないからもっと見るボタンも今は飛び先がない */}
          {/* <div className="flex justify-start">
            <SeeMoreButton to="/" />
          </div> */}
        </Section>

        <Section
          title="議論をお願いしているテーマ"
          description="Xで募集した、大きなテーマがこちらです。ご意見をお聞かせ下さい！"
          className="mb-6 bg-primary-weak rounded-3xl p-4 sm:p-8"
        >
          <div className="space-y-4">
            {themes.map((item) => (
              <ThemeCard
                key={item.id}
                id={item.id}
                title={item.title}
                description={item.description}
                keyQuestionCount={item.keyQuestionCount}
                commentCount={item.commentCount}
              />
            ))}
          </div>
          <div className="flex justify-start">
            <Button asChild size="lg" className="w-auto mt-4">
              <Link to="/themes">
                もっと見る
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default TopPageTemplate;
