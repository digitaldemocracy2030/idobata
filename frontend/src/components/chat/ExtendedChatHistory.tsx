import { useRef, useEffect } from 'react';
import { ExtendedMessage } from '../../types';
import { cn } from '../../lib/utils';
import { StreamingText } from './StreamingText';

interface ExtendedChatHistoryProps {
  messages: ExtendedMessage[];
}

function ExtendedChatHistory({ messages }: ExtendedChatHistoryProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-grow p-3 md:p-4 overflow-y-auto space-y-4 md:space-y-6 custom-scrollbar">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-neutral-400 text-sm">会話を始めましょう</p>
        </div>
      )}

      {messages.map((msg, index) => (
        <div
          key={index}
          className={cn(
            'animate-fade-in',
            {
              'flex justify-end': msg.type === 'user',
              'flex justify-start': msg.type === 'system',
              'flex justify-center': msg.type === 'system-message',
            }
          )}
        >
          <div className={cn(
            'flex flex-col max-w-[85%] sm:max-w-[75%] md:max-w-[65%]',
            {
              'items-end': msg.type === 'user',
              'items-start': msg.type === 'system',
              'items-center': msg.type === 'system-message',
            }
          )}>
            <div
              className={cn(
                'inline-block py-2 md:py-3 px-3 md:px-4 break-words',
                {
                  'bg-neutral-700 text-white shadow-sm rounded-2xl rounded-tr-sm': msg.type === 'user',
                  'bg-white border border-neutral-200 text-neutral-800 shadow-sm rounded-2xl rounded-tl-sm': msg.type === 'system',
                  'bg-neutral-100 border border-neutral-200 text-neutral-800 shadow-sm rounded-2xl': msg.type === 'system-message',
                }
              )}
            >
              <div className="text-xs md:text-sm whitespace-pre-wrap">
                {msg.isStreaming ? (
                  <StreamingText content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
            <div
              className={cn(
                'text-xs text-neutral-500 mt-1',
                {
                  'text-right mr-1': msg.type === 'user',
                  'ml-1': msg.type === 'system',
                  'text-center': msg.type === 'system-message',
                }
              )}
            >
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default ExtendedChatHistory;
