import { Button } from "../ui/button";
import { Section } from "../ui/section";

export interface CitizenReportExampleProps {
  introduction: string;
  issues: { title: string; description: string }[];
}

const CitizenReportExample = ({
  introduction,
  issues,
}: CitizenReportExampleProps) => {
  return (
    <div className="mb-8 border border-neutral-200 rounded-lg p-2 bg-white">
      <Section title="市民意見レポート例">
        <div className="text-base">
          <p className="mb-4">{introduction}</p>

          {issues.map((issue) => (
            <div key={issue.title} className="mb-3">
              <h3 className="font-medium text-sm mb-1">{issue.title}</h3>
              <p className="text-base text-neutral-600">{issue.description}</p>
            </div>
          ))}
          <div className="text-center">
            <Button size="lg" className="mt−4">
              PDFでダウンロード
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default CitizenReportExample;
