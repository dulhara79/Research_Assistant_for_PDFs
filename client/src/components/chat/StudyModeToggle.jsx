import React from "react";
import { GraduationCap, Globe } from "lucide-react";

export default function StudyModeToggle({ isStudyMode, onToggle }) {
  return (
    <div className="flex items-center justify-between mb-3 px-1 animate-fadeIn">
      <div className="flex items-center gap-2">
        {/* Toggle Switch */}
        <button
          onClick={() => onToggle(!isStudyMode)}
          type="button" // Important to prevent form submission if inside a form
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
            ${isStudyMode ? "bg-indigo-600" : "bg-slate-200"}
          `}
        >
          <span
            aria-hidden="true"
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
              ${isStudyMode ? "translate-x-5" : "translate-x-0"}
            `}
          />
        </button>

        {/* Label & Icon */}
        <span
          className={`text-sm font-medium flex items-center gap-1.5 ${
            isStudyMode ? "text-indigo-600" : "text-slate-500"
          }`}
        >
          {isStudyMode ? (
            <Globe className="w-4 h-4" />
          ) : (
            <GraduationCap className="w-4 h-4" />
          )}
          {isStudyMode ? "Study Mode On (Web + Wiki)" : "Standard RAG"}
        </span>
      </div>

      {/* Animation Status */}
      {isStudyMode && (
        <span className="text-xs text-indigo-500 animate-pulse font-medium">
          Accessing Internet & Wikipedia
        </span>
      )}
    </div>
  );
}
