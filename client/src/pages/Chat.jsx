import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import api from "../context/api";

// Import broken down components
import Sidebar from "../components/chat/Sidebar";
import EmptyState from "../components/chat/EmptyState";
import ChatInterface from "../components/chat/ChatInterface";
import SummaryPanel from "../components/chat/SummaryPanel";

export default function Chat() {
  // --- State Management ---
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [question, setQuestion] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- Effects ---
  useEffect(() => {
    fetchDocuments();
  }, []);

  // --- API Handlers ---
  const fetchDocuments = async () => {
    try {
      const res = await api.get("/documents");
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  };

  const handleSelectDocument = async (pdfId) => {
    setLoading(true);
    try {
      const doc = documents.find((d) => d.pdf_id === pdfId);
      setActiveDoc(doc);
      setSummary(doc?.summary || "No summary available.");

      const res = await api.get(`/history/${pdfId}`);
      setMessages(res.data.history || []);
      setSidebarOpen(false);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newDoc = {
        pdf_id: res.data.pdf_id,
        title: res.data.title,
        file_name: res.data.file_name,
        summary: res.data.summary,
      };

      setDocuments([newDoc, ...documents]);
      setActiveDoc(newDoc);
      setSummary(res.data.summary);
      setMessages([]);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload PDF");
    } finally {
      setUploading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !activeDoc) return;

    const currentQ = question;
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", content: currentQ }]);
    setLoading(true);

    try {
      const res = await api.post("/chat", {
        pdf_id: activeDoc.pdf_id,
        question: currentQ,
      });

      setMessages((prev) => [
        ...prev,
        { role: "bot", content: res.data.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "⚠️ Error getting response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveDoc(null);
    setMessages([]);
    setSummary("");
    setSidebarOpen(false);
  };

  const handleDeleteDocument = async (pdfId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      await api.delete(`/document/${pdfId}`);

      if (activeDoc && activeDoc.pdf_id === pdfId) {
        handleNewChat();
      }
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Could not delete document.");
    }
}

    // --- Render ---
    return (
      <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-bold text-white">ScholarSense</span>
        </div>

        <Sidebar
          documents={documents}
          activeId={activeDoc?.pdf_id}
          onSelect={handleSelectDocument}
          onNewChat={handleNewChat}
          onDelete={handleDeleteDocument}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <main className="flex-1 flex flex-col relative w-full pt-16 lg:pt-0 transition-all">
          {!activeDoc ? (
            <EmptyState onUpload={handleUpload} isUploading={uploading} />
          ) : (
            <div className="flex h-full">
              <ChatInterface
                activeDoc={activeDoc}
                messages={messages}
                loading={loading}
                onSend={handleAskQuestion}
                question={question}
                setQuestion={setQuestion}
              />
              <SummaryPanel summary={summary} title={activeDoc?.title} />
            </div>
          )}
        </main>
      </div>
    );
  };
