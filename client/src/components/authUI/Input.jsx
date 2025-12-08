import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({ label, error, type = "text", ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 ml-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={inputType}
          className={`w-full px-4 py-3 bg-white border rounded-lg outline-none transition-all duration-200 
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-slate-900 placeholder-slate-400 hover:border-slate-300"
            }
          `}
          {...props}
        />

        {/* Toggle Button for Password Fields */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 ml-1 font-medium">{error}</p>
      )}
    </div>
  );
}
