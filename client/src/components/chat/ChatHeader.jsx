import React from "react";
import { PanelLeftOpen, Menu, PanelRightOpen } from "lucide-react";

export default function ChatHeader({
  isSidebarOpen,
  setIsSidebarOpen,
  activeDoc,
  isSummaryOpen,
  setIsSummaryOpen,
}) {
  return (
    <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
            title="Open Sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}

        <button
          className="lg:hidden p-2 text-slate-500"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>

        <h1 className="font-semibold text-slate-800 truncate max-w-[200px] md:max-w-md">
          {activeDoc?.title || "Select a document"}
        </h1>
      </div>

      <div className="flex items-center">
        {!isSummaryOpen && activeDoc && (
          <button
            onClick={() => setIsSummaryOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-all"
          >
            <PanelRightOpen className="w-4 h-4" />
            <span className="hidden sm:inline">View Summary</span>
          </button>
        )}
      </div>
    </header>
  );
}
