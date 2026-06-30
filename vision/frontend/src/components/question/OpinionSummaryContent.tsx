interface ReportIssue {
  title: string;
  description: string;
}

interface ReportExample {
  introduction: string;
  issues: ReportIssue[];
}

interface OpinionSummaryContentProps {
  reportExample: ReportExample | null | undefined;
}

const OpinionSummaryContent = ({
  reportExample,
}: OpinionSummaryContentProps) => {
  if (!reportExample) {
    return (
      <div className="text-gray-500 text-center py-8">
        意見データを読み込み中...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 導入文 */}
      <p className="text-gray-800 leading-8">{reportExample.introduction}</p>

      {/* 課題一覧 */}
      {reportExample.issues && reportExample.issues.length > 0 && (
        <div className="space-y-6">
          {reportExample.issues.map((issue) => (
            <div key={issue.title}>
              <h5 className="text-xl font-bold text-gray-800 mb-3">
                {issue.title}
              </h5>
              <p className="text-gray-800 leading-8">{issue.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpinionSummaryContent;
