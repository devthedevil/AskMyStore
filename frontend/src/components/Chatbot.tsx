import { useState } from "react";
import { MessageCircle, X, Trash2, Sparkles } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useChat } from "../hooks/useChat";

const SUGGESTED_QUESTIONS = [
  "What was the total revenue last quarter?",
  "Which product has the highest profit margin?",
  "Show me monthly sales trends",
  "Who are the top customers?",
  "Which category generates most revenue?",
  "How many orders were cancelled?",
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, sendMessage, clearChat, messagesEndRef } =
    useChat();

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[420px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 chat-panel-enter overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  E-Commerce Assistant
                </h3>
                <p className="text-indigo-200 text-xs">
                  RAG-Powered Analytics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="w-8 h-8 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scrollbar">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} onSourceClick={sendMessage} />
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3 chat-message-enter">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
                  <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
                  <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
                  <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
                </div>
              </div>
            )}

            {/* Suggested questions - show only for first message */}
            {messages.length <= 1 && !isLoading && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  Try asking:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-300 ${
          isOpen
            ? "bg-gray-700 hover:bg-gray-800 rotate-0"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
        style={
          !isOpen
            ? { animation: "pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite" }
            : {}
        }
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </>
  );
}
