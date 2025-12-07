// import React, { useState } from "react";
// import api from "../context/api"
// import Header from "../components/Header";
// import UploadSection from "../components/UploadSection";
// import SummarySection from "../components/SummarySection";
// import ChatSection from "../components/ChatSection";
// import ConfirmationModal from "../components/ConfirmationModal";

// const API_URL = "http://localhost:8000";

// function Chat() {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [summary, setSummary] = useState("");
//   const [pdfId, setPDFId] = useState(null);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [question, setQuestion] = useState("");
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [isDragging, setIsDragging] = useState(false);
//   const [loadingResponse, setLoadingResponse] = useState(false);

//   // --- Handlers ---

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile && selectedFile.type === "application/pdf") {
//       setFile(selectedFile);
//     }
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const droppedFile = e.dataTransfer.files[0];
//     if (droppedFile && droppedFile.type === "application/pdf") {
//       setFile(droppedFile);
//     }
//   };

//   const handleUpload = async () => {
//     if (!file) return;
//     setLoading(true);
//     setSummary("");
//     setChatHistory([]);

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const response = await api.post("/upload", formData, {
//         headers: {
//             "Content-Type": "multipart/form-data",
//         }
//       });
//       const data = await response.data;

//       setPDFId(data.pdf_id);
//       setSummary(data.summary);
//     } catch (error) {
//       console.error("Upload failed", error);
//       setChatHistory([
//         { role: "bot", content: "⚠️ Failed to process PDF. Please try again." },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAskQuestion = async () => {
//     if (!question.trim()) return;

//     const currentQuestion = question;
//     setQuestion("");
//     setLoadingResponse(true);

//     setChatHistory((prev) => [
//       ...prev,
//       { role: "user", content: currentQuestion },
//     ]);

//     try {
//       const response = await api.post("/chat", {
//         "pdf_id": pdfId,
//         "question": currentQuestion,
//       })
//       const data = await response.data;

//       setChatHistory((prev) => [
//         ...prev,
//         { role: "bot", content: data.answer },
//       ]);
//     } catch (error) {
//       console.error("Chat failed", error);
//       setChatHistory((prev) => [
//         ...prev,
//         {
//           role: "bot",
//           content: "⚠️ Unable to retrieve answer. Please try again.",
//         },
//       ]);
//     } finally {
//       setLoadingResponse(false);
//     }
//   };

//   const handleClearConversation = () => {
//     setChatHistory([]);
//     setShowConfirmation(false);
//   };

//   return (
//     <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
//       <Header />

//       <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 lg:p-6 overflow-hidden">
//         <div className="w-full lg:w-1/2 flex flex-col gap-4 h-full">
//           <UploadSection
//             file={file}
//             loading={loading}
//             onFileChange={handleFileChange}
//             onUpload={handleUpload}
//             isDragging={isDragging}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//           />

//           <SummarySection summary={summary} loading={loading} />
//         </div>

//         <div className="w-full lg:w-1/2 h-full">
//           <ChatSection
//             chatHistory={chatHistory}
//             question={question}
//             setQuestion={setQuestion}
//             onAskQuestion={handleAskQuestion}
//             onClearChat={() => setShowConfirmation(true)}
//             pdfId={pdfId}
//             loadingResponse={loadingResponse}
//           />
//         </div>
//       </main>

//       <ConfirmationModal
//         isOpen={showConfirmation}
//         onClose={() => setShowConfirmation(false)}
//         onConfirm={handleClearConversation}
//         title="Clear Conversation?"
//         message="This will remove all messages from your current chat session."
//         type="danger"
//       />
//     </div>
//   );
// }

// export default Chat;

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
            const doc = documents.find(d => d.pdf_id === pdfId);
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
                headers: { "Content-Type": "multipart/form-data" }
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
        setMessages(prev => [...prev, { role: "user", content: currentQ }]);
        setLoading(true);

        try {
            const res = await api.post("/chat", {
                pdf_id: activeDoc.pdf_id,
                question: currentQ
            });

            setMessages(prev => [...prev, { role: "bot", content: res.data.answer }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: "bot", content: "⚠️ Error getting response." }]);
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

    // --- Render ---
    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 z-40">
                <button onClick={() => setSidebarOpen(true)} className="text-slate-400">
                    <Menu className="w-6 h-6" />
                </button>
                <span className="ml-4 font-bold text-white">ScholarSense</span>
            </div>

            <Sidebar 
                documents={documents} 
                activeId={activeDoc?.pdf_id}
                onSelect={handleSelectDocument}
                onNewChat={handleNewChat}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />

            <main className="flex-1 flex flex-col relative w-full pt-16 lg:pt-0 transition-all">
                {!activeDoc ? (
                    <EmptyState 
                        onUpload={handleUpload} 
                        isUploading={uploading}
                    />
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
                        <SummaryPanel summary={summary} />
                    </div>
                )}
            </main>
        </div>
    );
}