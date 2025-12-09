import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot,
  User as UserIcon,
  UploadCloud,
  Loader2,
  BookOpen,
} from "lucide-react";

export default function ChatMessageList({
  activeDoc,
  messages,
  loading,
  uploading,
  onUpload,
  source,
}) {
//   console.log("[DEBUG] ChatMessageList messages:", messages);
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
            onClick={() =>
              document.querySelector('input[type="file"]')?.click()
            } // Trigger the hidden input in parent
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
          {/* Avatar */}
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

          {/* Message Content */}
          <div
            className={`
                p-4 rounded-2xl text-sm leading-relaxed shadow-sm overflow-hidden
                ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-white text-slate-700 border border-slate-200 rounded-tl-sm"
                }
                `}
          >
            {/* MARKDOWN RENDERING LOGIC
             */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Bold text
                strong: ({ node, ...props }) => (
                  <span className="font-bold" {...props} />
                ),
                // Headings
                h1: ({ node, ...props }) => (
                  <h1 className="text-lg font-bold mt-2 mb-1" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-base font-bold mt-2 mb-1" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-sm font-bold mt-2 mb-1" {...props} />
                ),
                // Lists
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-4 space-y-1 mb-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-4 space-y-1 mb-2" {...props} />
                ),
                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                // Paragraphs
                p: ({ node, ...props }) => (
                  <p className="mb-2 last:mb-0" {...props} />
                ),
                // Code blocks
                code: ({ node, inline, className, children, ...props }) => {
                  return inline ? (
                    <code
                      className={`bg-slate-200 text-slate-800 px-1 py-0.5 rounded ${
                        msg.role === "user" ? "bg-indigo-500 text-white" : ""
                      }`}
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <div className="overflow-x-auto bg-slate-800 text-slate-100 p-2 rounded-md my-2">
                      <code className="block whitespace-pre" {...props}>
                        {children}
                      </code>
                    </div>
                  );
                },
              }}
            >
              {msg.content}
            </ReactMarkdown>

            {/* Answer Sources */}
            {msg.role !== "user" && msg.sources && msg.sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-3 h-3 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Sources
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* CHANGE msg.source.map TO msg.sources.map */}
                  {msg.sources.map((source, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded-md border border-slate-200"
                    >
                      {typeof source === "object"
                        ? source.page_label || JSON.stringify(source)
                        : source}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Loading Bubble */}
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
