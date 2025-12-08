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
    <div className="flex-1 flex flex-col h-full bg-slate-950/50">
      {/* Header */}
      <div className="h-16 border-b border-slate-800 flex items-center px-6 bg-slate-900/80 backdrop-blur-md">
        <FileText className="w-5 h-5 text-indigo-400 mr-3" />
        <h2 className="font-semibold text-slate-200 truncate">
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
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "user" ? "bg-indigo-600" : "bg-emerald-600"
              }`}
            >
              {msg.role === "user" ? (
                <MessageSquare className="w-4 h-4 text-white" />
              ) : (
                <History className="w-4 h-4 text-white" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                msg.role === "user"
                  ? "bg-slate-800 text-slate-100 rounded-tr-none"
                  : "bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none"
              }`}
            >
              <div className="markdown-body text-sm">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-emerald-600/50 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 rounded-tl-none">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about this document..."
            className="w-full bg-slate-800 text-white pl-4 pr-12 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-700 placeholder-slate-500 transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
