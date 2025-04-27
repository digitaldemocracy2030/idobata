import React from 'react';
import { SheetTitle, SheetClose } from '../ui/sheet';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface ChatHeaderProps {
  onDragStart: (clientY: number) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onDragStart }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    onDragStart(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      onDragStart(e.touches[0].clientY);
    }
  };

  return (
    <div
      className="p-4 border-b flex items-center justify-between cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="w-full flex flex-col items-center">
        <div className="w-10 h-1 bg-neutral-300 rounded-full mb-2" />
        <SheetTitle>チャット</SheetTitle>
      </div>
      <SheetClose asChild>
        <Button variant="ghost" size="icon" className="absolute right-4 top-4">
          <X className="h-5 w-5" />
        </Button>
      </SheetClose>
    </div>
  );
};
