import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  X,
  FileText,
  Trash2,
  Settings,
  LogOut,
  User,
  MoreHorizontal,
} from "lucide-react"; // Import Trash2
import api from "../../context/api";

export default function Sidebar({
  documents,
  onSelect,
  onDelete,
  onNewChat,
  activeId,
  isOpen,
  setIsOpen,
  onLogout,
  userToken,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure? This will permanently delete your account and all data."
      )
    ) {
      try {
        const response = await api.delete("auth/me", {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (response.ok || response.status === 204) {
          onLogout(); // Log the user out after deletion
        } else {
          alert("Failed to delete account");
        }
      } catch (error) {
        console.error("Error deleting account:", error);
      }
    }
  };

  return (
    <aside
      className={`
      fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col
      ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:static
    `}
    >
      <div className="h-full flex flex-col p-4">
        {/* --- Header --- */}
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

        {/* --- New Chat Button --- */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 mb-6 font-medium"
        >
          <Plus className="w-5 h-5" /> New Research
        </button>

        {/* --- Document List (Scrollable Area) --- */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar mb-4">
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

              <button
                onClick={(e) => {
                  e.stopPropagation();
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

        {/* --- Footer / User Settings (Pinned Bottom) --- */}
        <div
          className="border-t border-slate-800 pt-4 mt-auto relative"
          ref={menuRef}
        >
          {/* Pop-up Menu */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="p-1">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors text-left">
                  <Settings className="w-4 h-4" />
                  My Settings
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>

                <div className="h-px bg-slate-700 my-1 mx-2"></div>

                <button
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
              showUserMenu
                ? "bg-slate-800 border-slate-700 text-white"
                : "bg-transparent border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-slate-200">
                  Account
                </div>
                <div className="text-xs text-slate-500">Manage</div>
              </div>
            </div>
            <Settings
              className={`w-4 h-4 transition-transform duration-200 ${
                showUserMenu ? "rotate-90 text-indigo-400" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
