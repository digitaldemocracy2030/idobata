export interface CitizenReportExampleProps {
  introduction: string;
  issues: { title: string; description: string }[];
}

const CitizenReportExample = ({
  introduction,
  issues,
}: CitizenReportExampleProps) => {
  return (
    <div className="mb-8 border border-neutral-200 rounded-lg p-4 bg-white">
      <h2 className="text-lg font-semibold mb-4">市民意見レポート例</h2>
      <div className="text-sm">
        <p className="mb-4">{introduction}</p>
        
        {issues.map((issue, index) => (
          <div key={index} className="mb-3">
            <h3 className="font-medium text-sm mb-1">{issue.title}</h3>
            <p className="text-xs text-neutral-600">{issue.description}</p>
          </div>
        ))}
        
        <div className="mt-4 text-center">
          <button 
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm transition-colors duration-200"
            type="button"
          >
            PDFでダウンロード
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitizenReportExample;
