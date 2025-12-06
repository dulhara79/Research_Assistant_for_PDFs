import React, { useState } from "react";
import { FileText, Download, Loader2, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

const SummarySection = ({ summary, loading }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadPDF = async () => {
    if (!summary) return;
    setIsDownloading(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // 1. Get the content
      const content = document.getElementById("markdown-content");

      // 2. Clone the element to manipulate styles for PDF
      const clone = content.cloneNode(true);

      // 3. Set PDF-specific styles
      clone.style.width = "170mm";
      clone.style.padding = "0";
      clone.style.margin = "0";
      clone.style.background = "white";
      clone.style.color = "black";

      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.top = "-9999px";
      container.style.left = "0";
      container.style.background = "white";
      container.appendChild(clone);
      document.body.appendChild(container);

      // 4. Generate PDF
      await doc.html(clone, {
        callback: function (doc) {
          const totalPages = doc.getNumberOfPages();
          const date = new Date().toLocaleDateString();
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();

          for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);

            // Header
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text("Research Assistant AI", 15, 10);
            doc.text("Paper Summary Report", pageWidth - 15, 10, {
              align: "right",
            });

            // Lines
            doc.setDrawColor(226, 232, 240);
            doc.line(15, 12, pageWidth - 15, 12);
            doc.line(15, pageHeight - 12, pageWidth - 15, pageHeight - 12);

            // Footer
            doc.setFontSize(8);
            doc.text(`Generated on: ${date}`, 15, pageHeight - 8);
            doc.text(
              `Page ${i} of ${totalPages}`,
              pageWidth - 15,
              pageHeight - 8,
              { align: "right" }
            );
          }

          doc.save("research-summary.pdf");
          document.body.removeChild(container);
          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 2000);
        },
        x: 15,
        y: 20,
        width: 170,
        windowWidth: 800,
        margin: [20, 15, 20, 15],
        autoPaging: "text",
      });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden glow-border flex flex-col">
      <div className="shrink-0 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="text-blue-600" size={18} />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            Document Summary
          </h2>
        </div>
        {summary && (
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || loading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              downloadSuccess
                ? "bg-green-100 text-green-700"
                : "bg-white text-slate-700 hover:bg-slate-100 hover:text-indigo-600 border border-slate-200 shadow-sm"
            }`}
          >
            {isDownloading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : downloadSuccess ? (
              <CheckCircle size={16} />
            ) : (
              <Download size={16} />
            )}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-slate-600 font-medium">Extracting insights...</p>
          </div>
        ) : summary ? (
          <div className="animate-slideUp pb-4">
            <div id="markdown-content" className="markdown-body">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
            <FileText className="text-slate-400" size={48} />
            <p className="text-slate-600 font-medium">No summary available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummarySection;
