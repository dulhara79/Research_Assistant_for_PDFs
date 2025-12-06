import React from "react";
import { BookOpen, Sparkles } from "lucide-react";

const Header = () => (
  <header className="glass-effect border-b border-slate-200/60 sticky top-0 z-40">
    <div className="container mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 animate-slideDown">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Research Assistant AI
            </h1>
            <p className="text-xs text-slate-500">
              Powered by Advanced Analytics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles
            className="text-indigo-500 animate-pulse-custom"
            size={16}
          />
          <span className="text-xs font-medium text-slate-600">v2.0</span>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
