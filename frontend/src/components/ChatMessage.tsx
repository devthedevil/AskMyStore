import { Bot, User } from "lucide-react";
import { useMemo } from "react";
import type { ChatMessage as ChatMessageType } from "../types";

function renderMarkdown(text: string): string {
  return text
    // Headings: ### h3, ## h2, # h1
    .replace(/^###\s+(.+)$/gm, '<p class="font-semibold text-gray-900 mt-3 mb-1">$1</p>')
    .replace(/^##\s+(.+)$/gm, '<p class="font-bold text-gray-900 mt-3 mb-1">$1</p>')
    .replace(/^#\s+(.+)$/gm, '<p class="font-bold text-gray-900 text-base mt-3 mb-1">$1</p>')
    // Bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    // Italic: *text* or _text_ (but not inside words)
    .replace(/(?<!\w)\*([^*]+?)\*(?!\w)/g, "<em>$1</em>")
    .replace(/(?<!\w)_([^_]+?)_(?!\w)/g, "<em>$1</em>")
    // Inline code: `code`
    .replace(/`([^`]+?)`/g, '<code class="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs">$1</code>')
    // Numbered lists: lines starting with 1. 2. etc
    .replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Bullet points: lines starting with - or • or *
    .replace(/^[\s]*[-•*]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Wrap consecutive <li class="ml-4 list-decimal"> in <ol>
    .replace(/((?:<li class="ml-4 list-decimal">.*<\/li>\n?)+)/g, '<ol class="space-y-1 my-1">$1</ol>')
    // Wrap consecutive <li class="ml-4 list-disc"> in <ul>
    .replace(/((?:<li class="ml-4 list-disc">.*<\/li>\n?)+)/g, '<ul class="space-y-1 my-1">$1</ul>')
    // Line breaks
    .replace(/\n/g, "<br>");
}

export default function ChatMessage({ message, onSourceClick }: { message: ChatMessageType; onSourceClick?: (source: string) => void }) {
  const isUser = message.role === "user";

  const formattedContent = useMemo(() => {
    if (isUser) return null;
    return renderMarkdown(message.content);
  }, [message.content, isUser]);

  return (
    <div
      className={`chat-message-enter flex gap-3 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message bubble */}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-indigo-600 text-white rounded-tr-md whitespace-pre-wrap"
              : "bg-gray-100 text-gray-800 rounded-tl-md"
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <div
              className="chat-markdown"
              dangerouslySetInnerHTML={{ __html: formattedContent! }}
            />
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.sources.slice(0, 4).map((source, i) => (
              <button
                key={i}
                onClick={() => onSourceClick?.(source)}
                className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-medium rounded-full hover:bg-indigo-100 transition-colors cursor-pointer"
                title={`Ask about: ${source}`}
              >
                {source}
              </button>
            ))}
            {message.sources.length > 4 && (
              <button
                onClick={() => onSourceClick?.(message.sources![4])}
                className="text-[10px] text-gray-400 self-center hover:text-indigo-500 cursor-pointer transition-colors"
              >
                +{message.sources.length - 4} more
              </button>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p
          className={`text-[10px] text-gray-400 mt-1 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
