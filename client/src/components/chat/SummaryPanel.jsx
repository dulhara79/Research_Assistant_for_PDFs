import React from "react";
import ReactMarkdown from "react-markdown";

export default function SummaryPanel({ summary }) {
    return (
        <div className="hidden xl:block w-100 border-l border-slate-800 bg-slate-900/50 overflow-y-auto p-6">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4">Executive Summary</h3>
            <div className="prose prose-invert prose-sm prose-slate max-w-none">
                <div className="markdown-body text-xs text-slate-400">
                     <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}