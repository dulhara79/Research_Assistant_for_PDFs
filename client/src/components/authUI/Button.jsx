import { Loader2 } from "lucide-react";

export default function Button({
  children,
  isLoading,
  variant = "primary",
  className = "",
  ...props
}) {
  // Changed: focus:ring-offset-slate-900 -> focus:ring-offset-white
  const baseStyles =
    "relative inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    // Primary: Kept Indigo, but adjusted shadow slightly
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 border border-transparent",

    // Secondary: White bg, dark text, light border
    secondary:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",

    // Ghost: Darker text, light gray hover
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
