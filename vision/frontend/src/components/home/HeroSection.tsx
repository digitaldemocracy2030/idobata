import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Select } from "../ui/select";

interface HeroSectionProps {
  latestQuestions?: {
    _id: string;
    questionText: string;
    tagLine?: string;
    themeId?: string;
  }[];
}

const HeroSection = ({ latestQuestions = [] }: HeroSectionProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const navigate = useNavigate();

  const handleStartDialogue = () => {
    if (selectedQuestion) {
      const question = latestQuestions.find((q) => q._id === selectedQuestion);
      if (question?.themeId) {
        navigate(`/themes/${question.themeId}/questions/${selectedQuestion}`);
      }
    }
  };

  // Format options for the select dropdown
  const questionOptions = latestQuestions.map((q) => ({
    value: q._id,
    label: q.tagLine || `${q.questionText.substring(0, 50)}...`,
  }));

  return (
    <div className="relative py-12 overflow-hidden rounded-b-3xl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#94B9F9] to-[#9CE0E5] rounded-b-3xl">
        <div className="absolute inset-0 bg-white/70 rounded-b-3xl" />
      </div>

      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top right circle - slightly more than half visible */}
        <div className="absolute -top-[180px] -right-[180px] w-[450px] h-[450px]">
          <div className="w-full h-full rounded-full border-[100px] border-white/60" />
        </div>

        {/* Bottom left circle - slightly more than half visible */}
        <div className="absolute -bottom-[180px] -left-[180px] w-[450px] h-[450px]">
          <div className="w-full h-full rounded-full border-[100px] border-white/60" />
        </div>

        {/* Arrow decorations - hidden on mobile */}
        <svg
          className="hidden md:block absolute bottom-8 right-1/4 w-20 h-8"
          viewBox="0 0 73 28"
          aria-label="右下の矢印"
          fill="none"
          role="img"
        >
          <path
            d="M28.512 8.008C32.074 10.383 32.074 15.617 28.512 17.992L9.328 30.781C5.341 33.439 0 30.581 0 25.789L0 0.211C0 -4.581 5.341 -7.439 9.328 -4.781L28.512 8.008Z"
            fill="white"
            fillOpacity="0.6"
          />
          <path
            d="M72.512 8.008C76.074 10.383 76.074 15.617 72.512 17.992L53.328 30.781C49.341 33.439 44 30.581 44 25.789L44 0.211C44 -4.581 49.341 -7.439 53.328 -4.781L72.512 8.008Z"
            fill="white"
            fillOpacity="0.6"
          />
        </svg>

        <svg
          className="hidden md:block absolute top-16 left-1/4 w-20 h-8"
          viewBox="0 0 73 28"
          fill="none"
          aria-label="左上の矢印"
          role="img"
        >
          <path
            d="M28.512 8.008C32.074 10.383 32.074 15.617 28.512 17.992L9.328 30.781C5.341 33.439 0 30.581 0 25.789L0 0.211C0 -4.581 5.341 -7.439 9.328 -4.781L28.512 8.008Z"
            fill="white"
            fillOpacity="0.6"
          />
          <path
            d="M72.512 8.008C76.074 10.383 76.074 15.617 72.512 17.992L53.328 30.781C49.341 33.439 44 30.581 44 25.789L44 0.211C44 -4.581 49.341 -7.439 53.328 -4.781L72.512 8.008Z"
            fill="white"
            fillOpacity="0.6"
          />
        </svg>
      </div>

      <div className="relative z-10 px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-500 mb-6 tracking-tight">
            対話をはじめよう。
          </h1>

          <p className="text-md text-foreground font-bold mb-4 max-w-2xl mx-auto leading-relaxed">
            お題を選んで対話をはじめてください。
            <br />
            対話内容は自動でレポートにまとめられ、政策立案に活かされます。
          </p>

          <div className="flex flex-col items-center gap-4">
            {/* Question Dropdown */}
            <div className="w-full max-w-md">
              <Select
                value={selectedQuestion}
                onChange={(e) => setSelectedQuestion(e.target.value)}
                options={[
                  { value: "", label: "お題を選んでください" },
                  ...questionOptions,
                ]}
                size="lg"
                className="bg-white border-blue-400 border-2 text-gray-700"
              />
            </div>

            {/* Start Dialogue Button */}
            <Button
              onClick={handleStartDialogue}
              size="lg"
              disabled={!selectedQuestion}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-4 text-base font-medium rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              対話をはじめる
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
