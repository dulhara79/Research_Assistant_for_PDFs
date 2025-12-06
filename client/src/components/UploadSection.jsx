import React, { useRef } from "react";
import { Upload, FileText, Loader2, Sparkles } from "lucide-react";

const UploadSection = ({
  file,
  loading,
  onFileChange,
  onUpload,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const fileInputRef = useRef(null);

  return (
    // Compact Padding (p-4 instead of p-6)
    <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-4 glow-border shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
            <Upload className="text-indigo-600" size={14} />
          </div>
          <h2 className="text-sm font-semibold text-slate-800">
            Upload Research Paper
          </h2>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        {/* Compact Drag Area */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`flex-1 border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all flex items-center justify-center gap-3 ${
            isDragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            className="hidden"
          />

          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="text-indigo-600" size={20} />
          </div>

          <div className="text-left overflow-hidden">
            {file ? (
              <div>
                <p className="font-medium text-slate-800 text-sm truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-slate-700 text-sm">
                  Click to browse PDF
                </p>
                <p className="text-xs text-slate-500">or drop file here</p>
              </div>
            )}
          </div>
        </div>

        {/* Button sits next to upload area to save vertical space */}
        <button
          onClick={onUpload}
          disabled={!file || loading}
          className={`h-16 px-6 rounded-xl font-semibold transition-all duration-300 flex flex-col items-center justify-center gap-1 min-w-[100px] ${
            !file || loading
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Sparkles size={18} />
              <span className="text-xs">Analyze</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadSection;
