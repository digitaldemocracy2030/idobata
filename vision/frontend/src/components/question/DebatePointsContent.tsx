interface DebateAxis {
  title: string;
  options?: {
    label: string;
    description: string;
  }[];
}

interface DebateData {
  axes?: DebateAxis[];
  agreementPoints?: string[];
  disagreementPoints?: string[];
}

interface DebatePointsContentProps {
  debateData: DebateData | null | undefined;
}

const DebatePointsContent = ({ debateData }: DebatePointsContentProps) => {
  if (!debateData) {
    return (
      <div className="text-gray-500 text-center py-8">
        論点データを読み込み中...
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 主要な論点と対立軸 */}
      <div>
        <div className="border-b border-gray-300 pb-2 mb-4">
          <h4 className="text-2xl font-bold text-gray-800">
            主要な論点と対立軸
          </h4>
        </div>

        <div className="space-y-6">
          {/* 対立軸の表示 */}
          {debateData.axes?.map((axis) => (
            <div key={axis.title}>
              <h5 className="text-xl font-bold text-gray-800 mb-2">
                {axis.title}
              </h5>
              <div className="pl-6 space-y-4">
                {axis.options?.map((option) => (
                  <div key={option.label}>
                    <h6 className="font-bold text-gray-800 mb-1">
                      {option.label}
                    </h6>
                    <p className="text-gray-800 leading-8">
                      {option.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 合意点の表示 */}
          {debateData.agreementPoints &&
            debateData.agreementPoints.length > 0 && (
              <div>
                <h5 className="text-xl font-bold text-gray-800 mb-2">合意点</h5>
                <div className="pl-6 space-y-2">
                  {debateData.agreementPoints.map((point) => (
                    <p key={point} className="text-gray-800 leading-8">
                      • {point}
                    </p>
                  ))}
                </div>
              </div>
            )}

          {/* 対立点の表示 */}
          {debateData.disagreementPoints &&
            debateData.disagreementPoints.length > 0 && (
              <div>
                <h5 className="text-xl font-bold text-gray-800 mb-2">対立点</h5>
                <div className="pl-6 space-y-2">
                  {debateData.disagreementPoints.map((point) => (
                    <p key={point} className="text-gray-800 leading-8">
                      • {point}
                    </p>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DebatePointsContent;
