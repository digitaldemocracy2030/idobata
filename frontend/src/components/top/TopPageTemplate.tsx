import HeroSection from "../../components/home/HeroSection";
import type { Opinion } from "../../types";
import BreadcrumbView from "../common/BreadcrumbView";
import FeaturedQuestionsSection from "../home/FeaturedQuestionsSection";
import OpinionsSection from "../home/OpinionsSection";
import QuestionsTable from "../home/QuestionsTable";

export interface TopPageTemplateProps {
  latestThemes?: {
    _id: string;
    title: string;
    description?: string;
    slug?: string;
    keyQuestionCount?: number;
    commentCount?: number;
  }[];
  latestQuestions?: {
    _id: string;
    questionText: string;
    tagLine?: string;
    tags?: string[];
    themeId?: string;
    issueCount?: number;
    solutionCount?: number;
    likeCount?: number;
    uniqueParticipantCount?: number;
    createdAt?: string;
  }[];
  latestOpinions?: Opinion[];
}

const TopPageTemplate = ({
  latestThemes = [],
  latestQuestions = [],
  latestOpinions = [],
}: TopPageTemplateProps) => {
  const hasQuestions = latestQuestions.length > 0;
  const themesAsQuestions = latestThemes.map((theme) => ({
    id: theme._id,
    title: theme.title,
    description: theme.title,
    participantCount: theme.commentCount || 0,
    commentCount: theme.keyQuestionCount || 0,
    href: `/themes/${theme._id}`,
  }));

  const maxFeaturedQuestions = 70;
  const featuredQuestions = hasQuestions
    ? latestQuestions
        .map((q) => ({
          id: q._id,
          title: q.tagLine || "お題",
          description: q.questionText,
          participantCount: q.uniqueParticipantCount || 0,
          commentCount: q.issueCount || 0 + (q.solutionCount || 0),
          likeCount: q.likeCount || 0,
          themeId: q.themeId,
          tags: q.tags || [],
        }))
        .sort(
          (a, b) =>
            (b.participantCount || 0) +
            (b.commentCount || 0) +
            (b.likeCount || 0) -
            (a.participantCount || 0) -
            (a.commentCount || 0) -
            (a.likeCount || 0)
        )
        .slice(0, maxFeaturedQuestions)
    : themesAsQuestions.slice(0, maxFeaturedQuestions);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 pt-2">
        <BreadcrumbView items={[]} />
      </div>

      <HeroSection
        latestThemes={latestThemes}
        latestQuestions={latestQuestions}
      />

      <OpinionsSection opinions={latestOpinions} />

      <FeaturedQuestionsSection questions={featuredQuestions} />

      <QuestionsTable
        questions={
          hasQuestions
            ? latestQuestions.map((q) => ({
                id: q._id,
                category: q.tagLine || "未分類",
                title: q.questionText,
                questionText: q.questionText,
                postCount: (q.issueCount || 0) + (q.solutionCount || 0),
                lastUpdated: q.createdAt || new Date().toISOString(),
                themeId: q.themeId,
                tagLine: q.tagLine,
                description: q.questionText,
                participantCount: q.uniqueParticipantCount || 0,
                commentCount: q.issueCount || 0 + (q.solutionCount || 0),
              }))
            : themesAsQuestions.map((theme) => ({
                id: theme.id,
                category: "テーマ",
                title: theme.title,
                questionText: theme.title,
                postCount: theme.commentCount || 0,
                lastUpdated: new Date().toISOString(),
                themeId: theme.id,
                description: theme.title,
                participantCount: theme.participantCount || 0,
                commentCount: theme.commentCount || 0,
                href: theme.href,
              }))
        }
      />
    </div>
  );
};

export default TopPageTemplate;
