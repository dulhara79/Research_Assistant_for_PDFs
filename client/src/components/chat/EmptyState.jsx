import React, { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";

export default function EmptyState({ onUpload, isUploading }) {
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpload(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full text-center space-y-8 animate-fadeIn">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Research Intelligence
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Upload a research paper to generate structured summaries and chat with your document using AI.
                    </p>
                </div>

                <div 
                    className={`
                        relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300
                        flex flex-col items-center justify-center gap-4 cursor-pointer group
                        ${dragActive 
                            ? "border-indigo-500 bg-indigo-500/10 scale-102" 
                            : "border-slate-700 bg-slate-900/50 hover:border-indigo-500/50 hover:bg-slate-800/50"
                        }
                    `}
                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                >
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                        {isUploading ? (
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        ) : (
                            <Upload className="w-10 h-10 text-indigo-400" />
                        )}
                    </div>
                    <div>
                        <p className="text-xl font-medium text-slate-200">
                            {isUploading ? "Processing Document..." : "Click or drag PDF here"}
                        </p>
                        <p className="text-sm text-slate-500 mt-2">Supported format: PDF (Max 10MB)</p>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="application/pdf"
                        onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
                    />
                </div>
            </div>
        </div>
    );
}