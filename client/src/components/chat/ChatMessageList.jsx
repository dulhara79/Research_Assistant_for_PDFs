import React from "react";
import { Bot, User as UserIcon, UploadCloud, Loader2 } from "lucide-react";

export default function ChatMessageList({
  activeDoc,
  messages,
  loading,
  uploading,
  onUploadClick, // Pass the handler to trigger file input
}) {
  if (!activeDoc) {
    // EMPTY STATE 
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-6">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200">
          {uploading ? (
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          ) : (
            <UploadCloud className="w-10 h-10 text-slate-400" />
          )}
        </div>
        <h2 className="text-xl font-semibold text-slate-800">
          {uploading ? "Analyzing Document..." : "Start Your Research"}
        </h2>
        <p className="max-w-md text-center text-sm text-slate-500">
          {uploading
            ? "Please wait while we process your PDF and generate a summary."
            : "Upload a PDF document to generate a summary and start chatting with our AI assistant."}
        </p>
        {!uploading && (
          <button
            onClick={onUploadClick}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-200"
          >
            Upload PDF
          </button>
        )}
      </div>
    );
  }

  // MESSAGES LIST
  return (
    <>
      {messages.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-10 opacity-50">
          <Bot className="w-12 h-12 mb-2 text-slate-400" />
          <p className="text-slate-500">Ask a question about this document.</p>
        </div>
      )}

      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex gap-4 max-w-3xl mx-auto ${
            msg.role === "user" ? "flex-row-reverse" : ""
          }`}
        >
          <div
            className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm
                ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-indigo-600"
                }
                `}
          >
            {msg.role === "user" ? (
              <UserIcon className="w-5 h-5" />
            ) : (
              <Bot className="w-5 h-5" />
            )}
          </div>

          <div
            className={`
                p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-white text-slate-700 border border-slate-200 rounded-tl-sm"
                }
                `}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex gap-4 max-w-3xl mx-auto">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm">
            <div className="flex gap-1">
              <span
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
