import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../ui/base/sheet";

interface StarterQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  starterQuestions: string[];
  onSelectQuestion: (question: string | null) => void;
}

export const StarterQuestionModal: React.FC<StarterQuestionModalProps> = ({
  isOpen,
  onClose,
  starterQuestions,
  onSelectQuestion,
}) => {
  const handleSelectQuestion = (question: string | null) => {
    onSelectQuestion(question);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="p-0 h-auto rounded-t-xl overflow-hidden">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>会話を開始</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            会話の開始方法を選択してください：
          </p>
          <div className="space-y-2">
            {starterQuestions.map((question, index) => (
              <button
                type="button"
                key={`starter-question-${index}-${question.substring(0, 10)}`}
                className="flex items-center w-full p-3 rounded-lg border cursor-pointer hover:bg-accent/10 text-left"
                onClick={() => handleSelectQuestion(question)}
                aria-label={`質問を選択: ${question}`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{question}</p>
                </div>
              </button>
            ))}
            <button
              type="button"
              className="flex items-center w-full p-3 rounded-lg border cursor-pointer hover:bg-accent/10 text-left"
              onClick={() => handleSelectQuestion(null)}
              aria-label="自由に会話する"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">自由に会話する</p>
              </div>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
