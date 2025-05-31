import type React from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
  placeholder: string;
  isLoading: boolean;
}

function ChatInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  disabled,
  placeholder,
  isLoading,
}: ChatInputProps): React.ReactElement {
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className={`flex-shrink-0 flex ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <Textarea
        value={value}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="resize-none rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0 border-r-0"
      />
      <Button
        onClick={onSend}
        disabled={disabled || value.trim() === ""}
        variant="default"
        className="rounded-l-none bg-primary-500 hover:bg-primary-600 text-white h-auto border-l-0"
      >
        {isLoading ? "..." : "送信"}
      </Button>
    </div>
  );
}

export default ChatInput;
