import React, { useRef, useEffect } from "react";
import { FileText, MessageSquare, History, Loader2, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChatInterface({
  activeDoc,
  messages,
  loading,
  onSend,
  question,
  setQuestion,
}) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 flex items-center px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="p-2 bg-indigo-50 rounded-lg mr-3">
          <FileText className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="font-semibold text-slate-800 truncate">
          {activeDoc.title}
        </h2>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
        ref={scrollRef}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-4 animate-slideUp ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${
                msg.role === "user"
                  ? "bg-indigo-600 border-indigo-600"
                  : "bg-white border-slate-200"
              }`}
            >
              {msg.role === "user" ? (
                <MessageSquare className="w-4 h-4 text-white" />
              ) : (
                <History className="w-4 h-4 text-indigo-600" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-200"
                  : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
              }`}
            >
              <div className="markdown-body">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 rounded-tl-none shadow-sm">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
          className="relative flex items-center max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about this document..."
            className="w-full bg-slate-50 text-slate-900 pl-4 pr-12 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white border border-slate-200 placeholder-slate-400 transition-all shadow-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
