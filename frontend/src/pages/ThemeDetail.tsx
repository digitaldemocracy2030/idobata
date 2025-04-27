import { useState } from 'react';
import { useParams } from 'react-router-dom';
import BreadcrumbView from '../components/common/BreadcrumbView';
import KeyQuestionCard from '../components/theme/KeyQuestionCard';
import CommentCard from '../components/theme/CommentCard';

const ThemeDetail = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const [activeTab, setActiveTab] = useState<'issues' | 'solutions'>('issues');

  const themeData = {
    id: themeId,
    title: '若者の雇用とキャリア支援',
    description:
      '若者の雇用不安や将来への不安を解消し、安心してキャリアを築ける社会の実現について議論します。新卒一括採用や終身雇用の変化、フリーランスの増加など、働き方の多様化に対応した支援策を考えます。',
  };

  const keyQuestions = [
    {
      id: 1,
      question: 'どうすれば若者が安心して多様な働き方を選択できる社会になるか？',
      voteCount: 42,
      issueCount: 15,
      solutionCount: 23,
    },
    {
      id: 2,
      question: '新卒一括採用に代わる、若者の能力を活かせる採用の仕組みとは？',
      voteCount: 38,
      issueCount: 12,
      solutionCount: 18,
    },
    {
      id: 3,
      question: '若者のキャリア教育はどのように改善すべきか？',
      voteCount: 35,
      issueCount: 10,
      solutionCount: 16,
    },
  ];

  const issues = [
    { id: 1, text: '新卒一括採用の仕組みが、若者のキャリア選択の幅を狭めている' },
    { id: 2, text: '大学教育と実社会で求められるスキルにギャップがある' },
    { id: 3, text: '若者の非正規雇用が増加し、将来設計が立てにくい' },
    { id: 4, text: 'キャリア教育が不十分で、自分に合った仕事を見つけられない若者が多い' },
    { id: 5, text: '地方の若者は都市部に比べて就職機会が限られている' },
  ];

  const solutions = [
    { id: 1, text: 'インターンシップ制度の拡充と単位認定の推進' },
    { id: 2, text: '職業体験プログラムを中高生から段階的に導入する' },
    { id: 3, text: '若者向けのキャリアカウンセリングサービスの無料提供' },
    { id: 4, text: 'リモートワークの推進による地方在住若者の就業機会拡大' },
    { id: 5, text: '若者の起業支援と失敗しても再チャレンジできる制度の整備' },
  ];

  const breadcrumbItems = [
    { label: 'TOP', href: '/' },
    { label: 'テーマ一覧', href: '/themes' },
    { label: themeData.title, href: `/themes/${themeId}` },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbView items={breadcrumbItems} />

      <h1 className="text-2xl md:text-3xl font-bold mb-4">{themeData.title}</h1>

      <p className="text-sm text-neutral-600 mb-8">{themeData.description}</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">キークエスチョン ({keyQuestions.length})</h2>
        <div className="space-y-4">
          {keyQuestions.map(question => (
            <KeyQuestionCard
              key={question.id}
              question={question.question}
              voteCount={question.voteCount}
              issueCount={question.issueCount}
              solutionCount={question.solutionCount}
            />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">寄せられた意見</h2>

        <div className="flex border-b border-neutral-200 mb-4">
          <button
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'issues'
                ? 'border-b-2 border-purple-500 text-purple-700'
                : 'text-neutral-500'
            }`}
            onClick={() => setActiveTab('issues')}
          >
            課題点 ({issues.length})
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'solutions'
                ? 'border-b-2 border-purple-500 text-purple-700'
                : 'text-neutral-500'
            }`}
            onClick={() => setActiveTab('solutions')}
          >
            解決策 ({solutions.length})
          </button>
        </div>

        <div className="space-y-3">
          {activeTab === 'issues'
            ? issues.map(issue => <CommentCard key={issue.id} text={issue.text} type="issue" />)
            : solutions.map(solution => (
                <CommentCard key={solution.id} text={solution.text} type="solution" />
              ))}
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">気になること・思ったことをAIに質問</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="質問を入力してください"
            className="flex-grow p-2 border border-purple-200 rounded-md"
          />
          <button className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600">
            送信
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeDetail;
