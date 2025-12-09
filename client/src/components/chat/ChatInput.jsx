import React, { useMemo } from "react";
import { Send, AlertCircle } from "lucide-react";
import StudyModeToggle from "./StudyModeToggle";

export default function ChatInput({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  loading,
  isStudyMode,
  setIsStudyMode,
})
 {
  const MAX_WORDS = 1000;

  const wordCount = useMemo(() => {
    if (!inputMessage.trim()) return 0;
    // return inputMessage.trim().split(/\s+/).length;
    return inputMessage.trim().length;
  }, [inputMessage]);

  const isOverLimit = wordCount > MAX_WORDS;

  return (
<div className="p-4 border-t border-slate-200 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-end mb-2">
        {/* The Toggle Component */}
        <StudyModeToggle isStudyMode={isStudyMode} onToggle={setIsStudyMode} />
        <div
            className={`text-xs font-medium transition-colors ${
              isOverLimit ? "text-red-500" : "text-slate-400"
            }`}
          >
            {wordCount} / {MAX_WORDS} words
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              loading
                ? "Waiting for response..."
                : isStudyMode
                ? "Ask a broad question (e.g. 'Explain this concept and give examples')"
                : "Ask specifically about the document..."
            }
            disabled={loading}
            className={`
              w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-900 
              focus:outline-none focus:ring-1 transition-all shadow-sm disabled:opacity-50
              ${
                isStudyMode
                  ? "focus:border-indigo-500 focus:ring-indigo-500"
                  : "focus:border-slate-400 focus:ring-slate-400"
              }
            `}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className={`
              absolute right-2 top-2 p-1.5 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
              ${
                isStudyMode
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-slate-700 hover:bg-slate-800"
              }
            `}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-2">
          ScholarSense can make mistakes. Consider checking important
          information.
        </p>
      </div>
    </div>
  );
}
