export default function Input({ label, error, ...props }) {
  return (
    <div className="w-full space-y-1">
      {label && <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">{label}</label>}
      <input
        className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg outline-none transition-all duration-200 
          ${error 
            ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/50' 
            : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-slate-200 placeholder-slate-600'
          }
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
    </div>
  );
}