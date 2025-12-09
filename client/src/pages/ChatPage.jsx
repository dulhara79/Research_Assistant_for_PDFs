import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../context/api";

import Sidebar from "../components/chat/Sidebar";
import SummaryPanel from "../components/chat/SummaryPanel";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessageList from "../components/chat/ChatMessageList";
import ChatInput from "../components/chat/ChatInput";

export default function ChatPage() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [isStudyMode, setIsStudyMode] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState("");
  const [inputMessage, setInputMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch Documents on Load
  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
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
      setIsSummaryOpen(true);
    } catch (err) {
      alert("Failed to upload PDF");
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  const handleNewChatClick = () => {
    setActiveDoc(null);
    setMessages([]);
    setSummary("");
    setInputMessage("");
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get("/documents");
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  };

  const handleSelectDocument = async (pdfId) => {
    const doc = documents.find((d) => d.pdf_id === pdfId);
    setActiveDoc(doc);
    setSummary(doc?.summary || "Loading...");
    setMessages([]);

    if (window.innerWidth < 1024) setIsSidebarOpen(false);

    try {
      const res = await api.get(`/history/${pdfId}`);
      const formattedHistory = (res.data.history || []).map((msg) => ({
        ...msg,
        role: msg.role === "bot" ? "assistant" : msg.role,
      }));
      setMessages(formattedHistory);
      setSummary(doc?.summary || "No summary available.");
      if (window.innerWidth >= 1280) setIsSummaryOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  // const onFileChange = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;
  //   setUploading(true);
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   try {
  //     const res = await api.post("/upload", formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  //     const newDoc = {
  //       pdf_id: res.data.pdf_id,
  //       title: res.data.title,
  //       file_name: res.data.file_name,
  //       summary: res.data.summary,
  //     };
  //     setDocuments([newDoc, ...documents]);
  //     setActiveDoc(newDoc);
  //     setSummary(res.data.summary);
  //     setMessages([]);
  //     setIsSummaryOpen(true);
  //   } catch (err) {
  //     alert("Failed to upload PDF");
  //   } finally {
  //     setUploading(false);
  //     if (fileInputRef.current) fileInputRef.current.value = "";
  //   }
  // };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeDoc) return;

    const currentQ = inputMessage;
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: currentQ }]);
    setLoading(true);

    try {
      const res = await api.post("/chat", {
        pdf_id: activeDoc.pdf_id,
        question: currentQ,
        study_mode: isStudyMode,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error getting response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (pdfId) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await api.delete(`/document/${pdfId}`);
      setDocuments((docs) => docs.filter((d) => d.pdf_id !== pdfId));
      if (activeDoc && activeDoc.pdf_id === pdfId) {
        setActiveDoc(null);
        setMessages([]);
      }
    } catch (err) {
      alert("Could not delete.");
    }
  };

  // const handleNewChatClick = () => {
  //   fileInputRef.current?.click();
  // };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative text-slate-900 font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept="application/pdf"
      />

      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        documents={documents}
        activeId={activeDoc?.pdf_id}
        onSelect={handleSelectDocument}
        onDelete={handleDeleteDocument}
        onNewChat={handleNewChatClick}
        userToken={user?.token}
      />

      <main
        className={`
          flex-1 flex flex-col h-full transition-all duration-300 ease-in-out bg-white
          ${isSidebarOpen ? "lg:ml-72" : "lg:ml-0"} 
          ${isSummaryOpen ? "xl:mr-96" : "xl:mr-0"}
        `}
      >
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeDoc={activeDoc}
          isSummaryOpen={isSummaryOpen}
          setIsSummaryOpen={setIsSummaryOpen}
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth bg-slate-50/50">
          {/* <ChatMessageList
            activeDoc={activeDoc}
            messages={messages}
            loading={loading}
            uploading={uploading}
            onUploadClick={handleNewChatClick}
          /> */}
          <ChatMessageList
            activeDoc={activeDoc}
            messages={messages}
            loading={loading}
            uploading={uploading}
            onUpload={handleFileUpload}
          />
        </div>

        {activeDoc && (
          <ChatInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            loading={loading}
            isStudyMode={isStudyMode}
            setIsStudyMode={setIsStudyMode}
          />
        )}
      </main>

      <SummaryPanel
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        summary={summary}
        title={activeDoc?.title}
      />
    </div>
  );
}
