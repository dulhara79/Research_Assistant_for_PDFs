import React, { useRef, useEffect } from "react";
import { MessageSquare, X, Bot, User, Sparkles, Send } from "lucide-react";

const ChatSection = ({
  chatHistory,
  question,
  setQuestion,
  onAskQuestion,
  onClearChat,
  pdfId,
  loadingResponse,
}) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loadingResponse]);

  return (
    // FIX: h-full ensures it takes the full height of the parent
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden glow-border">
      {/* Header - Fixed Height */}
      <div className="shrink-0 bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <MessageSquare className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Research Q&A</h2>
            <p className="text-xs text-indigo-100">
              Ask anything about your document
            </p>
          </div>
        </div>
        {chatHistory.length > 0 && (
          <button
            onClick={onClearChat}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Messages Area - Flex Grow & Scroll */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-white space-y-4">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-3xl flex items-center justify-center">
                <Bot className="text-indigo-600" size={40} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <Sparkles className="text-white" size={12} />
              </div>
            </div>
            <p className="text-slate-500 text-sm max-w-xs">AI Chat Ready</p>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex chat-message ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] ${
                  msg.role === "user" ? "order-2" : "order-1"
                }`}
              >
                <div
                  className={`flex items-start gap-2 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-indigo-600 to-blue-600"
                        : "bg-gradient-to-br from-slate-200 to-slate-300"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="text-white" size={16} />
                    ) : (
                      <Bot className="text-slate-700" size={16} />
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-tr-sm"
                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {loadingResponse && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-100 rounded-2xl px-4 py-2 text-slate-500 text-sm">
              AI is thinking...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area - Fixed Height */}
      <div className="shrink-0 p-4 bg-white border-t border-slate-200">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder={pdfId ? "Ask a question..." : "Upload PDF to chat"}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && onAskQuestion()
            }
            disabled={!pdfId}
            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
          />
          <button
            onClick={onAskQuestion}
            disabled={!question.trim() || !pdfId || loadingResponse}
            className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg disabled:bg-slate-200"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
