export default function Input({ label, error, ...props }) {
  return (
    <div className="w-full space-y-1">
      {/* Label: slate-500 -> slate-700 for better contrast */}
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 ml-1">
          {label}
        </label>
      )}

      <input
        className={`w-full px-4 py-3 bg-white border rounded-lg outline-none transition-all duration-200 
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
              : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-slate-900 placeholder-slate-400 hover:border-slate-300"
          }
        `}
        {...props}
      />
      {/* Error: red-400 -> red-600 for visibility on white */}
      {error && (
        <p className="text-xs text-red-600 ml-1 font-medium">{error}</p>
      )}
    </div>
  );
}
