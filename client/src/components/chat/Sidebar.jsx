import React from "react";
import { MessageSquare, Plus, X, FileText, Trash2 } from "lucide-react"; // Import Trash2

export default function Sidebar({
  documents,
  onSelect,
  onDelete,
  onNewChat,
  activeId,
  isOpen,
  setIsOpen,
}) {
  return (
    <aside
      className={`
      fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
      ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:static
    `}
    >
      <div className="h-full flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xl">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span>ScholarSense</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 mb-6 font-medium"
        >
          <Plus className="w-5 h-5" /> New Research
        </button>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
            History
          </div>

          {documents.map((doc) => (
            <div
              key={doc.pdf_id}
              onClick={() => {
                onSelect(doc.pdf_id);
                setIsOpen(false);
              }}
              className={`group w-full text-left p-3 rounded-lg text-sm transition-all flex items-center justify-between gap-3 border cursor-pointer ${
                activeId === doc.pdf_id
                  ? "bg-indigo-900/20 border-indigo-500/50 text-indigo-300"
                  : "bg-transparent border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{doc.title || doc.file_name}</span>
              </div>

              {/* Delete Button - Appears on Group Hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevents opening the chat when deleting
                  onDelete(doc.pdf_id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-md transition-all"
                title="Delete Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {documents.length === 0 && (
            <div className="text-center text-slate-600 text-sm py-8 italic">
              No history yet
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
