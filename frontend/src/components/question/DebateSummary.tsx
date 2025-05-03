import { useState } from "react";

export interface DebateSummaryProps {
  axes: {
    title: string;
    options: { label: string; description: string }[];
  }[];
  agreementPoints: string[];
  disagreementPoints: string[];
  visualReport?: string | null;
}

const DebateSummary = ({
  axes,
  agreementPoints,
  disagreementPoints,
  visualReport,
}: DebateSummaryProps) => {
  const [activeTab, setActiveTab] = useState<"illustration" | "analysis">(
    "illustration"
  );

  return (
    <div className="mb-8 border border-neutral-200 rounded-lg p-4 bg-white">
      <h2 className="text-lg font-semibold mb-4">論点サマリー</h2>

      <div className="flex border-b border-neutral-200 mb-4">
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "illustration"
              ? "border-b-2 border-purple-500 text-purple-700"
              : "text-neutral-500"
          }`}
          onClick={() => setActiveTab("illustration")}
          type="button"
        >
          イラストまとめ
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "analysis"
              ? "border-b-2 border-purple-500 text-purple-700"
              : "text-neutral-500"
          }`}
          onClick={() => setActiveTab("analysis")}
          type="button"
        >
          論点分析
        </button>
      </div>

      {activeTab === "illustration" ? (
        <div className="text-center py-8 text-neutral-400">
          {visualReport ? (
            <div dangerouslySetInnerHTML={{ __html: visualReport }} />
          ) : (
            "イラストはまだ作成されていません"
          )}
        </div>
      ) : (
        <div>
          <h3 className="text-md font-medium mb-3">主要な論点と対立軸</h3>
          {axes.map((axis) => (
            <div key={`axis-${axis.title}`} className="mb-4">
              <h4 className="text-sm font-medium mb-2">{axis.title}</h4>
              <div className="pl-4 space-y-2">
                {axis.options.map((option) => (
                  <div key={`option-${axis.title}-${option.label}`}>
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-neutral-600">
                      {option.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <h3 className="text-md font-medium mt-5 mb-3">合意形成の状況</h3>
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">合意点</h4>
            <ul className="pl-5 list-disc text-sm">
              {agreementPoints.map((point) => (
                <li key={`point-${point}`} className="mb-1">
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">対立点</h4>
            <ul className="pl-5 list-disc text-sm">
              {disagreementPoints.map((point) => (
                <li key={`point-${point}`} className="mb-1">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebateSummary;
